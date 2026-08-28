/*!
 * nuosc-app.js — interactive front end for nuosc-engine.js.
 *
 * Controls, canvas plotting and the hover readout. All physics lives in
 * nuosc-engine.js; nothing here should compute a probability. No external
 * libraries: the page must keep working if a CDN is unreachable.
 */
(function () {
  "use strict";

  var NuOsc = window.NuOsc;
  if (!NuOsc) return;

  // Palette taken from the site's live design system (assets/css/main.scss
  // colour overrides + _sass/enhancements.scss custom properties): Ole Miss
  // navy #0d1e3a and crimson #c8102e on the light #f5f7fa ground. The site
  // imports Bootswatch Darkly but overrides it to a light theme, so anything
  // built against Darkly's dark defaults would render wrong.
  var C = {
    bg: "#ffffff", panel: "#ffffff", grid: "#e8edf3", axis: "#cbd5e1",
    text: "#1e293b", muted: "#64748b",
    live: "#0284c7", standard: "#c8102e", nominal: "#94a3b8",
    accent: "#2f855a", warn: "#b45309", probe: "#0d1e3a",
    flavour: ["#c8102e", "#0284c7", "#2f855a"]   // e, mu, tau
  };

  var PI = Math.PI;
  var $ = function (id) { return document.getElementById(id); };

  // ── State ────────────────────────────────────────────────────────────────
  var DEFAULTS = {
    experiment: "DUNE",
    L_km: 1300, rho_gcc: 2.848, E_min: 0.3, E_max: 10.0, nPoints: 400,
    ordering: 1, antineutrino: false,
    th12: 33.44, th13: 8.57, th23: 49.2,      // degrees
    dm21: 7.42,                                // 1e-5 eV^2
    dm31: 2.515,                               // 1e-3 eV^2, magnitude
    deltaCP: -1.601 / PI,                      // units of pi
    epsEMu: 0, epsETau: 0, epsMuTau: 0,
    deltaEMu: 0, deltaETau: 0, deltaMuTau: 0,  // units of pi
    showStandard: true, showNominal: false,
    view: "pair"
  };
  var S = Object.assign({}, DEFAULTS);
  var probeE = 2.5;
  var curves = null;

  // ── Control definitions ──────────────────────────────────────────────────
  var CONTROLS = [
    { g: "beam", k: "L_km", label: "Baseline L", unit: "km", min: 1, max: 13000, step: 1, fmt: function (v) { return v.toFixed(0); } },
    { g: "beam", k: "rho_gcc", label: "Matter density ρ", unit: "g/cm³", min: 0, max: 13, step: 0.001, fmt: function (v) { return v.toFixed(3); } },
    { g: "beam", k: "E_min", label: "E min", unit: "GeV", min: 0.02, max: 5, step: 0.01, fmt: function (v) { return v.toFixed(2); } },
    { g: "beam", k: "E_max", label: "E max", unit: "GeV", min: 0.5, max: 20, step: 0.1, fmt: function (v) { return v.toFixed(1); } },
    { g: "beam", k: "nPoints", label: "Grid points", unit: "", min: 50, max: 1200, step: 50, fmt: function (v) { return v.toFixed(0); } },

    { g: "pmns", k: "th12", label: "θ₁₂", unit: "°", min: 0, max: 90, step: 0.01, fmt: function (v) { return v.toFixed(2); } },
    { g: "pmns", k: "th13", label: "θ₁₃", unit: "°", min: 0, max: 90, step: 0.01, fmt: function (v) { return v.toFixed(2); } },
    { g: "pmns", k: "th23", label: "θ₂₃", unit: "°", min: 0, max: 90, step: 0.01, fmt: function (v) { return v.toFixed(2); } },
    { g: "pmns", k: "dm21", label: "Δm²₂₁", unit: "×10⁻⁵ eV²", min: 0, max: 20, step: 0.01, fmt: function (v) { return v.toFixed(2); } },
    { g: "pmns", k: "dm31", label: "|Δm²₃₁|", unit: "×10⁻³ eV²", min: 0.1, max: 6, step: 0.001, fmt: function (v) { return v.toFixed(3); } },
    { g: "pmns", k: "deltaCP", label: "δ_CP", unit: "π", min: -1, max: 1, step: 0.005, fmt: function (v) { return v.toFixed(3); } },

    { g: "nsi", k: "epsEMu", label: "|ε_eμ|", unit: "", min: 0, max: 0.5, step: 0.001, fmt: function (v) { return v.toFixed(3); } },
    { g: "nsi", k: "deltaEMu", label: "δ_eμ", unit: "π", min: -1, max: 1, step: 0.005, fmt: function (v) { return v.toFixed(3); } },
    { g: "nsi", k: "epsETau", label: "|ε_eτ|", unit: "", min: 0, max: 0.5, step: 0.001, fmt: function (v) { return v.toFixed(3); } },
    { g: "nsi", k: "deltaETau", label: "δ_eτ", unit: "π", min: -1, max: 1, step: 0.005, fmt: function (v) { return v.toFixed(3); } },
    { g: "nsi", k: "epsMuTau", label: "|ε_μτ|", unit: "", min: 0, max: 0.5, step: 0.001, fmt: function (v) { return v.toFixed(3); } },
    { g: "nsi", k: "deltaMuTau", label: "δ_μτ", unit: "π", min: -1, max: 1, step: 0.005, fmt: function (v) { return v.toFixed(3); } }
  ];

  function pmnsFromState() {
    return {
      th12: S.th12 * NuOsc.DEG, th13: S.th13 * NuOsc.DEG, th23: S.th23 * NuOsc.DEG,
      dm21: S.dm21 * 1e-5,
      dm31: S.ordering * S.dm31 * 1e-3,
      deltaCP: S.deltaCP * PI
    };
  }
  function nsiFromState() {
    return {
      epsEMu: S.epsEMu, epsETau: S.epsETau, epsMuTau: S.epsMuTau,
      deltaEMu: S.deltaEMu * PI, deltaETau: S.deltaETau * PI, deltaMuTau: S.deltaMuTau * PI
    };
  }
  function nsiActive() { return S.epsEMu > 0 || S.epsETau > 0 || S.epsMuTau > 0; }

  // ── Build the control panel ──────────────────────────────────────────────
  function buildControls() {
    CONTROLS.forEach(function (c) {
      var host = $("nuosc-group-" + c.g);
      if (!host) return;
      var row = document.createElement("div");
      row.className = "nuosc-ctl";
      // The number box is not decoration: a slider cannot express delta_CP = 0.5 pi
      // exactly, and a researcher reproducing a figure needs to type the value.
      row.innerHTML =
        '<div class="nuosc-ctl-head"><label for="nuosc-' + c.k + '">' + c.label +
        '</label><span class="nuosc-num-wrap">' +
        '<input type="number" class="nuosc-num" id="nuosc-out-' + c.k +
        '" min="' + c.min + '" max="' + c.max + '" step="' + c.step +
        '" aria-label="' + c.label + ' value">' +
        '<span class="nuosc-unit">' + (c.unit || "") + "</span>" +
        "</span></div>" +
        '<input type="range" class="form-range" id="nuosc-' + c.k + '" min="' + c.min +
        '" max="' + c.max + '" step="' + c.step + '">';
      host.appendChild(row);

      var input = $("nuosc-" + c.k);
      var num = $("nuosc-out-" + c.k);
      input.value = S[c.k];

      function commit(raw) {
        var v = parseFloat(raw);
        if (!isFinite(v)) return;
        v = Math.max(c.min, Math.min(c.max, v));
        S[c.k] = v;
        if (c.g === "beam" && (c.k === "L_km" || c.k === "rho_gcc" || c.k === "E_min" || c.k === "E_max")) {
          setExperiment("Custom", true);
        }
        if (c.k === "E_min" && S.E_min >= S.E_max) S.E_min = S.E_max - 0.05;
        if (c.k === "E_max" && S.E_max <= S.E_min) S.E_max = S.E_min + 0.05;
        input.value = S[c.k];
        syncReadouts();
        schedule();
      }

      input.addEventListener("input", function () { commit(input.value); });
      num.addEventListener("input", function () { commit(num.value); });
      num.addEventListener("blur", function () { syncReadouts(true); });
    });
    syncReadouts();
  }

  function syncReadouts(force) {
    CONTROLS.forEach(function (c) {
      var out = $("nuosc-out-" + c.k);
      var input = $("nuosc-" + c.k);
      if (!out) return;
      // Never rewrite the box the user is typing into — that eats keystrokes.
      if (force || document.activeElement !== out) out.value = c.fmt(S[c.k]);
      if (input && parseFloat(input.value) !== S[c.k]) input.value = S[c.k];
    });
    var nsiOn = nsiActive();
    document.querySelectorAll(".nuosc-nsi-dep").forEach(function (el) {
      el.classList.toggle("nuosc-dim", !nsiOn);
    });
    $("nuosc-ordering-label").textContent = S.ordering > 0 ? "Normal" : "Inverted";
    $("nuosc-beam-label").textContent = S.antineutrino ? "Antineutrino beam" : "Neutrino beam";
  }

  function setExperiment(name, silent) {
    S.experiment = name;
    var sel = $("nuosc-experiment");
    if (sel && sel.value !== name) sel.value = name;
    if (name === "Custom" || silent) return;
    var p = NuOsc.PRESETS[name];
    if (!p) return;
    S.L_km = p.L_km; S.rho_gcc = p.rho_gcc;
    S.E_min = p.E_range[0]; S.E_max = p.E_range[1];
    probeE = p.E_peak;
  }

  // ── Compute ──────────────────────────────────────────────────────────────
  var pending = null;
  function schedule() {
    if (pending) return;
    pending = requestAnimationFrame(function () { pending = null; recompute(); });
  }

  function recompute() {
    var t0 = performance.now();
    curves = NuOsc.computeCurves({
      L_km: S.L_km, rho_gcc: S.rho_gcc, E_min: S.E_min, E_max: S.E_max,
      nPoints: Math.round(S.nPoints), pmns: pmnsFromState(), nsi: nsiFromState(),
      antineutrino: S.antineutrino,
      includeStandard: true, includeNominal: S.showNominal
    });
    var dt = performance.now() - t0;
    $("nuosc-timing").textContent = dt.toFixed(1) + " ms";
    render();
    writeHash();
  }

  // ── Canvas plotting ──────────────────────────────────────────────────────
  function fitCanvas(cv, cssH) {
    var dpr = window.devicePixelRatio || 1;
    var w = cv.parentNode.clientWidth;
    cv.style.width = w + "px";
    cv.style.height = cssH + "px";
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(cssH * dpr);
    var ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: cssH };
  }

  function niceTicks(lo, hi, target) {
    var span = hi - lo;
    if (!(span > 0)) return [lo];
    var raw = span / target;
    var mag = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
    var norm = raw / mag;
    var step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
    var ticks = [];
    for (var v = Math.ceil(lo / step) * step; v <= hi + step * 1e-9; v += step) ticks.push(v);
    return ticks;
  }

  function drawPanel(cv, cfg, cssH) {
    var f = fitCanvas(cv, cssH), ctx = f.ctx, W = f.w, H = f.h;
    var pad = cfg.compact
      ? { l: 42, r: 8, t: 20, b: 26 }
      : { l: 58, r: 12, t: 26, b: 40 };
    var x0 = pad.l, y0 = pad.t, x1 = W - pad.r, y1 = H - pad.b;
    var xr = cfg.xr, yr = cfg.yr;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = C.panel;
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);

    var sx = function (v) { return x0 + (v - xr[0]) / (xr[1] - xr[0]) * (x1 - x0); };
    var sy = function (v) { return y1 - (v - yr[0]) / (yr[1] - yr[0]) * (y1 - y0); };

    // grid + ticks
    var xt = niceTicks(xr[0], xr[1], cfg.compact ? 4 : 7);
    var yt = niceTicks(yr[0], yr[1], cfg.compact ? 3 : 5);
    ctx.font = (cfg.compact ? "10px " : "11px ") + "system-ui, sans-serif";
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
    ctx.fillStyle = C.muted;
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    xt.forEach(function (v) {
      var X = Math.round(sx(v)) + 0.5;
      if (X < x0 || X > x1) return;
      ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke();
      ctx.fillText(formatTick(v), X, y1 + 5);
    });
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    yt.forEach(function (v) {
      var Y = Math.round(sy(v)) + 0.5;
      if (Y < y0 || Y > y1) return;
      ctx.beginPath(); ctx.moveTo(x0, Y); ctx.lineTo(x1, Y); ctx.stroke();
      ctx.fillText(formatTick(v), x0 - 6, Y);
    });

    // series
    ctx.save();
    ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
    cfg.series.forEach(function (s) {
      if (!s || !s.y) return;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width || 2;
      ctx.setLineDash(s.dash || []);
      ctx.beginPath();
      for (var i = 0; i < s.x.length; i++) {
        var X = sx(s.x[i]), Y = sy(s.y[i]);
        if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    });
    // probe line
    if (cfg.probeX != null && cfg.probeX >= xr[0] && cfg.probeX <= xr[1]) {
      ctx.strokeStyle = C.probe; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
      var PX = Math.round(sx(cfg.probeX)) + 0.5;
      ctx.beginPath(); ctx.moveTo(PX, y0); ctx.lineTo(PX, y1); ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();

    // frame
    ctx.strokeStyle = C.axis; ctx.lineWidth = 1;
    ctx.strokeRect(Math.round(x0) + 0.5, Math.round(y0) + 0.5, Math.round(x1 - x0), Math.round(y1 - y0));

    // labels
    ctx.fillStyle = C.text;
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.font = (cfg.compact ? "600 11px " : "600 13px ") + "system-ui, sans-serif";
    ctx.fillText(cfg.title, x0, y0 - 8);
    if (!cfg.compact) {
      ctx.fillStyle = C.muted;
      ctx.font = "11px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(cfg.xlabel || "Neutrino energy (GeV)", (x0 + x1) / 2, H - 6);
      ctx.save();
      ctx.translate(13, (y0 + y1) / 2);
      ctx.rotate(-PI / 2);
      ctx.fillText(cfg.ylabel || "Probability", 0, 0);
      ctx.restore();
    }
    return { sx: sx, sy: sy, box: [x0, y0, x1, y1] };
  }

  function formatTick(v) {
    if (v === 0) return "0";
    var a = Math.abs(v);
    if (a >= 1000) return v.toFixed(0);
    if (a >= 1) return (Math.round(v * 100) / 100).toString();
    if (a >= 0.01) return (Math.round(v * 1000) / 1000).toString();
    return v.toExponential(1);
  }

  // Extract channel beta<-alpha as a plain array.
  function channel(P, n, beta, alpha) {
    var out = new Float64Array(n);
    for (var i = 0; i < n; i++) out[i] = P[i * 9 + beta * 3 + alpha];
    return out;
  }

  function chLabel(alpha, beta) {
    var F = NuOsc.FLAVOUR_LABELS;
    var bar = S.antineutrino ? "̄" : "";
    return "P(ν" + bar + F[alpha] + " → ν" + bar + F[beta] + ")";
  }

  // ── Render ───────────────────────────────────────────────────────────────
  var lastGeom = null;

  function render() {
    if (!curves) return;
    var n = curves.energy.length, E = curves.energy;
    var xr = [S.E_min, S.E_max];

    document.querySelectorAll("[data-view]").forEach(function (el) {
      el.style.display = el.getAttribute("data-view") === S.view ? "" : "none";
    });

    function seriesFor(beta, alpha) {
      var out = [];
      if (S.showNominal && curves.nominal) {
        out.push({ x: E, y: channel(curves.nominal, n, beta, alpha), color: C.nominal, width: 1.5, dash: [2, 3] });
      }
      if (S.showStandard && curves.standard && nsiActive()) {
        out.push({ x: E, y: channel(curves.standard, n, beta, alpha), color: C.standard, width: 1.75, dash: [7, 4] });
      }
      out.push({ x: E, y: channel(curves.live, n, beta, alpha), color: C.live, width: 2.25 });
      return out;
    }

    if (S.view === "pair") {
      lastGeom = drawPanel($("nuosc-cv-appear"), {
        xr: xr, yr: [0, autoMax(channel(curves.live, n, 0, 1))],
        series: seriesFor(0, 1), title: chLabel(1, 0) + "  —  appearance", probeX: probeE
      }, 300);
      drawPanel($("nuosc-cv-disappear"), {
        xr: xr, yr: [0, 1.02], series: seriesFor(1, 1),
        title: chLabel(1, 1) + "  —  disappearance", probeX: probeE
      }, 300);
    } else if (S.view === "grid") {
      for (var beta = 0; beta < 3; beta++) {
        for (var alpha = 0; alpha < 3; alpha++) {
          var cv = $("nuosc-cv-" + alpha + beta);
          if (!cv) continue;
          drawPanel(cv, {
            xr: xr, yr: [0, autoMax(channel(curves.live, n, beta, alpha))],
            series: seriesFor(beta, alpha), title: chLabel(alpha, beta),
            probeX: probeE, compact: true
          }, 170);
        }
      }
    } else if (S.view === "residual") {
      var res = [];
      if (curves.standard) {
        [[0, 1], [1, 1]].forEach(function (c, i) {
          var live = channel(curves.live, n, c[0], c[1]);
          var std = channel(curves.standard, n, c[0], c[1]);
          var d = new Float64Array(n);
          for (var k = 0; k < n; k++) d[k] = live[k] - std[k];
          res.push({ x: E, y: d, color: i === 0 ? C.accent : C.warn, width: 2.25 });
        });
      }
      var lim = 0.001;
      res.forEach(function (s) { for (var k = 0; k < s.y.length; k++) lim = Math.max(lim, Math.abs(s.y[k])); });
      lim *= 1.15;
      drawPanel($("nuosc-cv-residual"), {
        xr: xr, yr: [-lim, lim], series: res,
        title: "NSI residual  —  P(with NSI) − P(NSI = 0)",
        ylabel: "ΔP", probeX: probeE
      }, 340);
    }

    renderProbe();
    renderStatus();
  }

  function autoMax(y) {
    var m = 0;
    for (var i = 0; i < y.length; i++) if (y[i] > m) m = y[i];
    return Math.max(0.02, m * 1.18);
  }

  function nearestIndex(E, v) {
    var best = 0, bd = Infinity;
    for (var i = 0; i < E.length; i++) {
      var d = Math.abs(E[i] - v);
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }

  function renderProbe() {
    if (!curves) return;
    var i = nearestIndex(curves.energy, probeE);
    var e = curves.energy[i];
    $("nuosc-probe-energy").textContent = e.toFixed(3) + " GeV";
    var F = NuOsc.FLAVOUR_LABELS;
    var bar = S.antineutrino ? "̄" : "";
    var html = '<table class="nuosc-probe-table"><thead><tr><th></th>' +
      F.map(function (f) { return "<th>from ν" + bar + f + "</th>"; }).join("") + "</tr></thead><tbody>";
    for (var beta = 0; beta < 3; beta++) {
      html += '<tr><th>to ν' + bar + F[beta] + "</th>";
      for (var alpha = 0; alpha < 3; alpha++) {
        var p = curves.live[i * 9 + beta * 3 + alpha];
        var std = curves.standard ? curves.standard[i * 9 + beta * 3 + alpha] : null;
        var delta = "";
        if (std != null && nsiActive()) {
          var d = p - std;
          delta = '<span class="nuosc-delta" style="color:' + (Math.abs(d) > 1e-4 ? C.accent : C.muted) + '">' +
            (d >= 0 ? "+" : "−") + Math.abs(d).toFixed(4) + "</span>";
        }
        var strong = (alpha === 1 && (beta === 0 || beta === 1));
        html += "<td" + (strong ? ' class="nuosc-strong"' : "") + ">" +
          p.toFixed(5) + delta + "</td>";
      }
      html += "</tr>";
    }
    html += "</tbody></table>";
    $("nuosc-probe-table-host").innerHTML = html;

    // flavour composition bar for a nu_mu beam
    var comp = [0, 1, 2].map(function (beta) { return curves.live[i * 9 + beta * 3 + 1]; });
    var barHtml = "";
    comp.forEach(function (v, beta) {
      barHtml += '<div class="nuosc-bar-seg" style="width:' + (v * 100).toFixed(3) +
        "%;background:" + C.flavour[beta] + '" title="ν' + F[beta] + " " + (v * 100).toFixed(2) + '%"></div>';
    });
    $("nuosc-composition").innerHTML = barHtml;
    $("nuosc-composition-legend").innerHTML = comp.map(function (v, beta) {
      return '<span class="nuosc-key"><i style="background:' + C.flavour[beta] + '"></i>ν' + bar + F[beta] +
        " " + (v * 100).toFixed(2) + "%</span>";
    }).join("");
  }

  // Warn when the energy grid is too coarse to resolve the oscillation itself.
  // Fast wiggles at low E are then sampling artefacts, not structure, and a
  // research tool should say so rather than draw them straight-faced.
  function aliasEnergy() {
    if (!curves) return 0;
    var E = curves.energy;
    var dm = Math.abs(S.dm31 * 1e-3);
    var worst = 0;
    for (var i = 1; i < E.length; i++) {
      var dphi = 1.267 * dm * S.L_km * Math.abs(1 / E[i - 1] - 1 / E[i]);
      if (dphi > PI / 2 && E[i] > worst) worst = E[i];
    }
    return worst;
  }

  function renderStatus() {
    var alias = aliasEnergy();
    $("nuosc-alias").textContent = alias > 0
      ? "⚠ under-sampled below ≈ " + alias.toFixed(2) + " GeV — raise the grid points"
      : "";
    var bits = [];
    bits.push("L = " + S.L_km.toFixed(0) + " km");
    bits.push("ρ = " + S.rho_gcc.toFixed(3) + " g/cm³");
    bits.push(S.ordering > 0 ? "normal ordering" : "inverted ordering");
    bits.push(S.antineutrino ? "antineutrinos" : "neutrinos");
    bits.push(nsiActive() ? "NSI on" : "NSI off");
    bits.push(Math.round(S.nPoints) + " points");
    $("nuosc-status").textContent = bits.join(" · ");
  }

  // ── URL hash so a configuration can be shared or cited ───────────────────
  var KEYS = ["L_km", "rho_gcc", "E_min", "E_max", "nPoints", "ordering", "th12", "th13",
    "th23", "dm21", "dm31", "deltaCP", "epsEMu", "epsETau", "epsMuTau",
    "deltaEMu", "deltaETau", "deltaMuTau"];
  var hashTimer = null;
  function writeHash() {
    if (hashTimer) clearTimeout(hashTimer);
    hashTimer = setTimeout(function () {
      var parts = KEYS.map(function (k) { return k + "=" + (+S[k]).toPrecision(6); });
      if (S.antineutrino) parts.push("anti=1");
      parts.push("view=" + S.view);
      try {
        history.replaceState(null, "", "#" + parts.join("&"));
      } catch (e) { /* file:// or blocked history — the page still works */ }
    }, 400);
  }
  function readHash() {
    var h = (location.hash || "").replace(/^#/, "");
    if (!h) return false;
    var got = false;
    h.split("&").forEach(function (pair) {
      var kv = pair.split("=");
      if (kv.length !== 2) return;
      var k = kv[0], v = kv[1];
      if (k === "anti") { S.antineutrino = v === "1"; got = true; return; }
      if (k === "view") { if (["pair", "grid", "residual"].indexOf(v) >= 0) { S.view = v; got = true; } return; }
      if (KEYS.indexOf(k) >= 0 && isFinite(parseFloat(v))) { S[k] = parseFloat(v); got = true; }
    });
    if (got) S.experiment = "Custom";
    return got;
  }

  // ── Wiring ───────────────────────────────────────────────────────────────
  function attachProbe(cv) {
    function pick(ev) {
      if (!lastGeom && S.view !== "grid" && S.view !== "residual") return;
      var r = cv.getBoundingClientRect();
      // account for the plot's left/right padding
      var padL = 58, padR = 12;
      if (cv.dataset.compact === "1") { padL = 42; padR = 8; }
      var inner = (r.width - padL - padR);
      var f = (ev.clientX - r.left - padL) / inner;
      f = Math.max(0, Math.min(1, f));
      probeE = S.E_min + f * (S.E_max - S.E_min);
      render();
    }
    cv.addEventListener("mousedown", pick);
    cv.addEventListener("mouseenter", function () { cv.dataset.track = "1"; });
    cv.addEventListener("mouseleave", function () { cv.dataset.track = "0"; });
    cv.addEventListener("mousemove", function (ev) { if (cv.dataset.track === "1") pick(ev); });
  }

  function init() {
    buildControls();

    var sel = $("nuosc-experiment");
    Object.keys(NuOsc.PRESETS).concat(["Custom"]).forEach(function (name) {
      var o = document.createElement("option");
      o.value = name; o.textContent = name;
      sel.appendChild(o);
    });
    sel.value = S.experiment;
    sel.addEventListener("change", function () {
      setExperiment(sel.value);
      syncReadouts();
      recompute();
    });

    $("nuosc-ordering").addEventListener("click", function () {
      S.ordering = -S.ordering;
      syncReadouts(); recompute();
    });
    $("nuosc-antineutrino").addEventListener("click", function () {
      S.antineutrino = !S.antineutrino;
      syncReadouts(); recompute();
    });
    $("nuosc-show-standard").addEventListener("change", function (e) {
      S.showStandard = e.target.checked; recompute();
    });
    $("nuosc-show-nominal").addEventListener("change", function (e) {
      S.showNominal = e.target.checked; recompute();
    });
    $("nuosc-reset").addEventListener("click", function () {
      S = Object.assign({}, DEFAULTS);
      setExperiment(S.experiment);
      var cbS = $("nuosc-show-standard"), cbN = $("nuosc-show-nominal");
      cbS.checked = S.showStandard; cbN.checked = S.showNominal;
      probeE = NuOsc.PRESETS[S.experiment].E_peak;
      syncReadouts(); recompute();
    });
    $("nuosc-zero-nsi").addEventListener("click", function () {
      S.epsEMu = S.epsETau = S.epsMuTau = 0;
      syncReadouts(); recompute();
    });

    document.querySelectorAll(".nuosc-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        S.view = btn.getAttribute("data-tab");
        document.querySelectorAll(".nuosc-tab").forEach(function (b) {
          b.classList.toggle("active", b === btn);
        });
        render();
      });
    });

    document.querySelectorAll("canvas.nuosc-canvas").forEach(attachProbe);

    $("nuosc-png").addEventListener("click", function () {
      var cv = document.querySelector('[data-view="' + S.view + '"] canvas');
      if (!cv) return;
      var a = document.createElement("a");
      a.download = "nuosc-" + S.view + ".png";
      a.href = cv.toDataURL("image/png");
      a.click();
    });

    var fromHash = readHash();
    if (!fromHash) setExperiment(S.experiment);
    syncReadouts();
    recompute();

    var rt = null;
    window.addEventListener("resize", function () {
      if (rt) clearTimeout(rt);
      rt = setTimeout(render, 120);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
