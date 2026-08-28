/*
 * Golden-file test: assert the browser engine reproduces nuosclab's validated
 * `numpy_ref` Python engine. Regenerate the golden file with
 * tests/golden/generate_golden.py whenever the upstream physics changes.
 *
 * Run: node tests/js/test-engine.js
 */
const fs = require("fs");
const path = require("path");
const NuOsc = require("../../assets/js/nuosc-engine.js");

const csv = fs.readFileSync(path.join(__dirname, "../golden/nuosc_golden.csv"), "utf8")
  .trim().split("\n").slice(1);

// Group rows by (setup, energy) so each engine call covers a full 3x3 block.
const groups = new Map();
for (const line of csv) {
  const [L, rho, anti, ordering, nsiOn, E, beta, alpha, P] = line.split(",");
  const key = [L, rho, anti, ordering, nsiOn, E].join("|");
  if (!groups.has(key)) {
    groups.set(key, {
      L: +L, rho: +rho, anti: anti === "1", ordering: +ordering,
      nsiOn: nsiOn === "1", E: +E, expect: new Float64Array(9),
    });
  }
  groups.get(key).expect[+beta * 3 + +alpha] = +P;
}

const TOL = 1e-10;
let maxDiff = 0, worst = null, checked = 0;

for (const g of groups.values()) {
  const pmns = NuOsc.defaultPMNS();
  pmns.dm31 = g.ordering * 2.515e-3;
  const nsi = g.nsiOn
    ? { epsEMu: 0.18, epsETau: 0.09, epsMuTau: 0.06,
        deltaEMu: 1.1, deltaETau: -2.3, deltaMuTau: 0.45 }
    : NuOsc.defaultNSI();

  const P = NuOsc.probabilities([g.E], g.L, g.rho, pmns, nsi, g.anti);
  for (let i = 0; i < 9; i++) {
    const d = Math.abs(P[i] - g.expect[i]);
    checked++;
    if (d > maxDiff) {
      maxDiff = d;
      worst = `L=${g.L} rho=${g.rho} anti=${g.anti} ord=${g.ordering} nsi=${g.nsiOn} E=${g.E} ch=${i}`;
    }
  }
}

// Independent physics checks that do not depend on the golden file at all.
let maxUnitarity = 0, maxNeg = 0;
const grid = NuOsc.linspace(0.05, 12, 250);
for (const anti of [false, true]) {
  for (const ord of [1, -1]) {
    const pmns = NuOsc.defaultPMNS();
    pmns.dm31 = ord * 2.515e-3;
    const nsi = { epsEMu: 0.25, epsETau: 0.2, epsMuTau: 0.15,
                  deltaEMu: 2.0, deltaETau: 1.0, deltaMuTau: -1.5 };
    const P = NuOsc.probabilities(grid, 1300, 2.848, pmns, nsi, anti);
    for (let n = 0; n < grid.length; n++) {
      for (let a = 0; a < 3; a++) {
        let col = 0, row = 0;
        for (let b = 0; b < 3; b++) {
          col += P[n * 9 + b * 3 + a];      // sum over final flavours = 1
          row += P[n * 9 + a * 3 + b];      // sum over initial flavours = 1
          maxNeg = Math.min(maxNeg, P[n * 9 + b * 3 + a]);
        }
        maxUnitarity = Math.max(maxUnitarity, Math.abs(col - 1), Math.abs(row - 1));
      }
    }
  }
}

// Vacuum limit: at rho = 0 with NSI off, P(nu_mu->nu_mu) must match the
// analytic two-flavour form closely for theta13 -> 0, dm21 -> 0.
const pv = NuOsc.defaultPMNS();
pv.th13 = 0; pv.dm21 = 0;
const Ev = NuOsc.linspace(0.5, 5, 60);
const Pv = NuOsc.probabilities(Ev, 810, 0, pv, NuOsc.defaultNSI(), false);
let maxVac = 0;
for (let n = 0; n < Ev.length; n++) {
  const arg = 1.267 * pv.dm31 * 810 / Ev[n];
  const analytic = 1 - Math.pow(Math.sin(2 * pv.th23), 2) * Math.pow(Math.sin(arg), 2);
  maxVac = Math.max(maxVac, Math.abs(Pv[n * 9 + 1 * 3 + 1] - analytic));
}

console.log(`golden points checked : ${checked}`);
console.log(`max |P_js - P_numpy|  : ${maxDiff.toExponential(3)}   (worst: ${worst})`);
console.log(`max unitarity residual: ${maxUnitarity.toExponential(3)}`);
console.log(`most negative P       : ${maxNeg.toExponential(3)}`);
console.log(`max vacuum-limit dev  : ${maxVac.toExponential(3)}  (vs analytic 2-flavour)`);

let failed = false;
if (!(maxDiff < TOL)) { console.error(`FAIL: golden agreement ${maxDiff} exceeds ${TOL}`); failed = true; }
if (!(maxUnitarity < 1e-12)) { console.error(`FAIL: unitarity ${maxUnitarity}`); failed = true; }
if (maxNeg < -1e-12) { console.error(`FAIL: negative probability ${maxNeg}`); failed = true; }
if (!(maxVac < 2e-3)) { console.error(`FAIL: vacuum limit ${maxVac}`); failed = true; }
if (failed) process.exit(1);
console.log("\nOK — browser engine agrees with nuosclab numpy_ref.");
