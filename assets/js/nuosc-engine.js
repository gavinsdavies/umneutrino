/*!
 * nuosc-engine.js — three-flavour PMNS + NSI neutrino oscillation engine.
 *
 * A dependency-free JavaScript port of nuosclab/physics.py from
 * https://github.com/gavinsdavies/nuosclab (MIT), which in turn mirrors
 * OscLib's PMNS_NSI.cxx. Units: L in km, E in GeV, masses in eV^2,
 * density in g/cm^3. Constants are PDG 2024 via OscLib/Constants.h.
 *
 * This file is validated against the upstream `numpy_ref` engine by a
 * golden-file test (tests/js/test-engine.js). Do not edit the physics here
 * without re-running that test — the whole point of the golden file is that
 * this port cannot silently drift away from the validated Python.
 *
 * Probability convention matches upstream: P[n][beta][alpha] = P(nu_alpha -> nu_beta),
 * flattened as P[n*9 + beta*3 + alpha]. Flavour order: 0 = e, 1 = mu, 2 = tau.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.NuOsc = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // ── Physical constants (matching OscLib/Constants.h exactly) ──────────────
  const GEV_TO_EV = 1e9;
  const KM_TO_M = 1e3;
  const G_F = 1.1663788e-5;        // Fermi constant, GeV^-2
  const N_A = 6.02214076e23;       // Avogadro, mol^-1
  const C_LIGHT = 299792458.0;     // m/s
  const HBAR = 6.582119569e-25;    // GeV s
  const HBAR_C_EV_M = C_LIGHT * HBAR * GEV_TO_EV;   // eV m
  const HBAR_C_EV_CM = HBAR_C_EV_M * 100;           // eV cm
  const Y_E = 0.5;                 // electrons per nucleon (standard rock)

  // V_CC [eV] = KMATTER * Ne [mol/cm^3] = sqrt(2) G_F N_A (hbar c)^3
  const KMATTER =
    Math.SQRT2 * (G_F / (GEV_TO_EV * GEV_TO_EV)) * N_A *
    (HBAR_C_EV_CM * HBAR_C_EV_CM * HBAR_C_EV_CM);

  const DEG = Math.PI / 180;

  // ── Defaults: PDG-2024 normal-ordering best fit, as upstream ──────────────
  function defaultPMNS() {
    return {
      th12: 33.44 * DEG,
      th13: 8.57 * DEG,
      th23: 49.2 * DEG,
      dm21: 7.42e-5,     // eV^2
      dm31: 2.515e-3,    // eV^2 (normal ordering; negate for inverted)
      deltaCP: -1.601,   // radians
    };
  }

  function defaultNSI() {
    return {
      epsEMu: 0, epsETau: 0, epsMuTau: 0,
      deltaEMu: 0, deltaETau: 0, deltaMuTau: 0,
    };
  }

  // ── Experiment presets (upstream nuosclab/presets.py) ─────────────────────
  const PRESETS = {
    NOvA: { name: "NOvA", L_km: 810, rho_gcc: 2.79, E_range: [0.3, 5.0], E_peak: 1.9 },
    DUNE: { name: "DUNE", L_km: 1300, rho_gcc: 2.848, E_range: [0.3, 10.0], E_peak: 2.5 },
    T2K: { name: "T2K", L_km: 295, rho_gcc: 2.6, E_range: [0.1, 2.0], E_peak: 0.6 },
  };

  const FLAVOUR_LABELS = ["e", "μ", "τ"];

  // ── PMNS matrix, PDG convention (physics.py: pmns_matrix) ─────────────────
  // Returns {re, im} as flat length-9 arrays, U[a*3 + i]: row = flavour, col = mass state.
  function pmnsMatrix(p) {
    const s12 = Math.sin(p.th12), c12 = Math.cos(p.th12);
    const s13 = Math.sin(p.th13), c13 = Math.cos(p.th13);
    const s23 = Math.sin(p.th23), c23 = Math.cos(p.th23);
    const cd = Math.cos(p.deltaCP), sd = Math.sin(p.deltaCP);   // e^{i delta}
    const re = new Float64Array(9), im = new Float64Array(9);

    re[0] = c12 * c13;                              im[0] = 0;
    re[1] = s12 * c13;                              im[1] = 0;
    re[2] = s13 * cd;                               im[2] = -s13 * sd;   // s13 * conj(e^{i d})

    re[3] = -s12 * c23 - c12 * s23 * s13 * cd;      im[3] = -c12 * s23 * s13 * sd;
    re[4] = c12 * c23 - s12 * s23 * s13 * cd;       im[4] = -s12 * s23 * s13 * sd;
    re[5] = s23 * c13;                              im[5] = 0;

    re[6] = s12 * s23 - c12 * c23 * s13 * cd;       im[6] = -c12 * c23 * s13 * sd;
    re[7] = -c12 * s23 - s12 * c23 * s13 * cd;      im[7] = -s12 * c23 * s13 * sd;
    re[8] = c23 * c13;                              im[8] = 0;
    return { re, im };
  }

  // ── Jacobi eigensolver for a real symmetric 6x6 ───────────────────────────
  // A 3x3 complex Hermitian H = A + iB is embedded as the real symmetric
  // [[A, -B], [B, A]]. Every eigenvalue then appears twice: if u is a complex
  // eigenvector, both (Re u, Im u) and (-Im u, Re u) are real eigenvectors of
  // the embedding, and they represent the same complex ray (u and i*u).
  // Selecting one per pair is done in `_selectComplexBasis` by complex
  // Gram-Schmidt rather than by eigenvalue index, so near-degenerate physical
  // eigenvalues (level crossings, MSW resonance) cannot scramble the pairing.
  //
  // The matrix is rescaled to O(1) before sweeping and the eigenvalues are
  // scaled back afterwards. That matters: H entries run ~1e-13 eV, so absolute
  // convergence thresholds would silently stop iterating while the *relative*
  // error was still ~1e-11 — which the long-baseline phase lambda*L/hbar*c then
  // amplifies into a visible probability error. Returns the scale factor.
  function _jacobi6(A, V) {
    const n = 6;
    for (let i = 0; i < n * n; i++) V[i] = 0;
    for (let i = 0; i < n; i++) V[i * n + i] = 1;

    let scale = 0;
    for (let i = 0; i < n * n; i++) {
      const a = Math.abs(A[i]);
      if (a > scale) scale = a;
    }
    if (scale === 0) return 0;
    for (let i = 0; i < n * n; i++) A[i] /= scale;

    for (let sweep = 0; sweep < 40; sweep++) {
      let off = 0;
      for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++) off += A[i * n + j] * A[i * n + j];
      if (off < 1e-34) break;

      for (let p = 0; p < n; p++) {
        for (let q = p + 1; q < n; q++) {
          const apq = A[p * n + q];
          if (Math.abs(apq) < 1e-19) continue;
          const theta = (A[q * n + q] - A[p * n + p]) / (2 * apq);
          const sgn = theta >= 0 ? 1 : -1;
          const t = sgn / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
          const c = 1 / Math.sqrt(t * t + 1);
          const s = t * c;
          for (let k = 0; k < n; k++) {
            const akp = A[k * n + p], akq = A[k * n + q];
            A[k * n + p] = c * akp - s * akq;
            A[k * n + q] = s * akp + c * akq;
          }
          for (let k = 0; k < n; k++) {
            const apk = A[p * n + k], aqk = A[q * n + k];
            A[p * n + k] = c * apk - s * aqk;
            A[q * n + k] = s * apk + c * aqk;
          }
          for (let k = 0; k < n; k++) {
            const vkp = V[k * n + p], vkq = V[k * n + q];
            V[k * n + p] = c * vkp - s * vkq;
            V[k * n + q] = s * vkp + c * vkq;
          }
        }
      }
    }
    return scale;
  }

  // Pick 3 complex-orthonormal eigenvectors from the 6 real ones.
  // Greedy complex Gram-Schmidt: a candidate that is merely i*(already accepted)
  // projects out to (almost) nothing and is skipped; a genuinely new direction
  // survives with a large residual. This is index-free, so it stays correct when
  // two physical eigenvalues coincide.
  function _selectComplexBasis(A, V, scale, outVals, outRe, outIm) {
    const n = 6;
    const order = [0, 1, 2, 3, 4, 5].sort((i, j) => A[i * n + i] - A[j * n + j]);
    let found = 0;
    const vr = new Float64Array(3), vi = new Float64Array(3);

    for (let k = 0; k < 6 && found < 3; k++) {
      const idx = order[k];
      for (let i = 0; i < 3; i++) {
        vr[i] = V[i * n + idx];
        vi[i] = V[(i + 3) * n + idx];
      }
      // Orthogonalize against everything already accepted (complex inner product).
      for (let a = 0; a < found; a++) {
        let dr = 0, di = 0;   // <accepted | candidate> = sum conj(w_i) v_i
        for (let i = 0; i < 3; i++) {
          const wr = outRe[a * 3 + i], wi = outIm[a * 3 + i];
          dr += wr * vr[i] + wi * vi[i];
          di += wr * vi[i] - wi * vr[i];
        }
        for (let i = 0; i < 3; i++) {
          const wr = outRe[a * 3 + i], wi = outIm[a * 3 + i];
          vr[i] -= dr * wr - di * wi;
          vi[i] -= dr * wi + di * wr;
        }
      }
      let nrm = 0;
      for (let i = 0; i < 3; i++) nrm += vr[i] * vr[i] + vi[i] * vi[i];
      if (nrm < 0.25) continue;          // this was the i*u partner of an accepted vector
      nrm = Math.sqrt(nrm);
      for (let i = 0; i < 3; i++) {
        outRe[found * 3 + i] = vr[i] / nrm;
        outIm[found * 3 + i] = vi[i] / nrm;
      }
      outVals[found] = A[idx * n + idx] * scale;
      found++;
    }
    return found;
  }

  /**
   * Oscillation probabilities on an energy grid.
   *
   * @param {ArrayLike<number>} energyGeV  energies in GeV
   * @param {number} baselineKm            baseline L in km
   * @param {number} rhoGcc                constant matter density in g/cm^3
   * @param {object} pmns                  {th12, th13, th23, dm21, dm31, deltaCP}
   * @param {object} nsi                   {epsEMu, epsETau, epsMuTau, deltaEMu, deltaETau, deltaMuTau}
   * @param {boolean} antineutrino
   * @returns {Float64Array} length 9N, P[n*9 + beta*3 + alpha]
   */
  function probabilities(energyGeV, baselineKm, rhoGcc, pmns, nsi, antineutrino) {
    const N = energyGeV.length;
    const P = new Float64Array(N * 9);
    const U = pmnsMatrix(pmns);
    const anti = !!antineutrino;
    const sgn = anti ? -1 : 1;

    // ── NSI matter potential (physics.py: _nsi_potential) ───────────────────
    const V0 = KMATTER * rhoGcc * Y_E;      // eV
    const Vre = new Float64Array(9), Vim = new Float64Array(9);
    Vre[0] = sgn * V0;                      // the standard CC term on (e,e)
    const offdiag = [
      [0, 1, nsi.epsEMu, nsi.deltaEMu],
      [0, 2, nsi.epsETau, nsi.deltaETau],
      [1, 2, nsi.epsMuTau, nsi.deltaMuTau],
    ];
    for (let k = 0; k < 3; k++) {
      const i = offdiag[k][0], j = offdiag[k][1];
      const mag = offdiag[k][2], ph = offdiag[k][3];
      const r = mag * Math.cos(ph);
      let m = mag * Math.sin(ph);
      if (anti) m = -m;                     // conj(epsilon) on the upper triangle
      Vre[i * 3 + j] = sgn * V0 * r;  Vim[i * 3 + j] = sgn * V0 * m;
      Vre[j * 3 + i] = sgn * V0 * r;  Vim[j * 3 + i] = -sgn * V0 * m;
    }

    const L_m = baselineKm * KM_TO_M;
    const M = new Float64Array(36), Vec = new Float64Array(36);
    const evals = new Float64Array(3);
    const evr = new Float64Array(9), evi = new Float64Array(9);
    const Hre = new Float64Array(9), Him = new Float64Array(9);
    const Ure = new Float64Array(9), Uim = new Float64Array(9);
    const d = new Float64Array(3);

    for (let n = 0; n < N; n++) {
      const E_eV = energyGeV[n] * GEV_TO_EV;
      d[0] = 0;
      d[1] = pmns.dm21 / (2 * E_eV);
      d[2] = pmns.dm31 / (2 * E_eV);

      // H_vac[a][b] = sum_i U[a][i] d_i conj(U[b][i]); antineutrinos take the conjugate.
      for (let a = 0; a < 3; a++) {
        for (let b = 0; b < 3; b++) {
          let sr = 0, si = 0;
          for (let i = 0; i < 3; i++) {
            const ar = U.re[a * 3 + i], ai = U.im[a * 3 + i];
            const br = U.re[b * 3 + i], bi = -U.im[b * 3 + i];  // conj
            sr += d[i] * (ar * br - ai * bi);
            si += d[i] * (ar * bi + ai * br);
          }
          if (anti) si = -si;
          Hre[a * 3 + b] = sr + Vre[a * 3 + b];
          Him[a * 3 + b] = si + Vim[a * 3 + b];
        }
      }

      // Real 6x6 embedding [[Hre, -Him], [Him, Hre]]
      for (let a = 0; a < 3; a++) {
        for (let b = 0; b < 3; b++) {
          const hr = Hre[a * 3 + b], hi = Him[a * 3 + b];
          M[a * 6 + b] = hr;
          M[a * 6 + (b + 3)] = -hi;
          M[(a + 3) * 6 + b] = hi;
          M[(a + 3) * 6 + (b + 3)] = hr;
        }
      }

      const scale = _jacobi6(M, Vec);
      _selectComplexBasis(M, Vec, scale, evals, evr, evi);

      // Evolution operator: U_evol = sum_i exp(-i lambda_i L / hbar c) u_i u_i^dagger
      Ure.fill(0); Uim.fill(0);
      for (let k = 0; k < 3; k++) {
        const ph = -evals[k] * L_m / HBAR_C_EV_M;
        const cp = Math.cos(ph), sp = Math.sin(ph);
        for (let a = 0; a < 3; a++) {
          const ar = evr[k * 3 + a], ai = evi[k * 3 + a];
          for (let b = 0; b < 3; b++) {
            const br = evr[k * 3 + b], bi = evi[k * 3 + b];
            const pr = ar * br + ai * bi;      // Re(u_a conj(u_b))
            const pi = ai * br - ar * bi;      // Im(u_a conj(u_b))
            Ure[a * 3 + b] += cp * pr - sp * pi;
            Uim[a * 3 + b] += cp * pi + sp * pr;
          }
        }
      }

      const base = n * 9;
      for (let beta = 0; beta < 3; beta++) {
        for (let alpha = 0; alpha < 3; alpha++) {
          const r = Ure[beta * 3 + alpha], i = Uim[beta * 3 + alpha];
          P[base + beta * 3 + alpha] = r * r + i * i;
        }
      }
    }
    return P;
  }

  function linspace(a, b, n) {
    const out = new Float64Array(n);
    if (n === 1) { out[0] = a; return out; }
    const step = (b - a) / (n - 1);
    for (let i = 0; i < n; i++) out[i] = a + step * i;
    return out;
  }

  /**
   * Mirror of nuosclab.compute_curves: live / standard (NSI = 0) / nominal
   * (default PMNS, NSI = 0) on a shared energy grid.
   */
  function computeCurves(config) {
    const cfg = Object.assign({
      L_km: 1300, rho_gcc: 2.848, E_min: 0.3, E_max: 10.0, nPoints: 400,
      pmns: defaultPMNS(), nsi: defaultNSI(), antineutrino: false,
      includeStandard: true, includeNominal: true,
    }, config || {});
    if (cfg.nPoints < 2) throw new Error("nPoints must be at least 2");

    const energy = linspace(cfg.E_min, cfg.E_max, cfg.nPoints);
    const live = probabilities(energy, cfg.L_km, cfg.rho_gcc, cfg.pmns, cfg.nsi, cfg.antineutrino);
    const standard = cfg.includeStandard
      ? probabilities(energy, cfg.L_km, cfg.rho_gcc, cfg.pmns, defaultNSI(), cfg.antineutrino)
      : null;
    const nominal = cfg.includeNominal
      ? probabilities(energy, cfg.L_km, cfg.rho_gcc, defaultPMNS(), defaultNSI(), cfg.antineutrino)
      : null;
    return { config: cfg, energy, live, standard, nominal };
  }

  return {
    DEG, PRESETS, FLAVOUR_LABELS,
    defaultPMNS, defaultNSI, pmnsMatrix,
    probabilities, computeCurves, linspace,
    _constants: { KMATTER, HBAR_C_EV_M, Y_E },
  };
});
