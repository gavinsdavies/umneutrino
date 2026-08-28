# Validation harness for the browser oscillation engine

`assets/js/nuosc-engine.js` is a JavaScript port of the physics in
[nuosclab](https://github.com/gavinsdavies/nuosclab) (`nuosclab/physics.py`,
the `numpy_ref` engine), which itself mirrors OscLib's `PMNS_NSI`.

A port is only defensible if it cannot drift away from the thing it was
ported from. That is what this directory is for: the browser engine is
pinned to the Python reference by a golden file, so any change to either
side that moves a probability shows up as a test failure rather than as a
quietly wrong curve on a public web page.

This extends the validation ladder nuosclab already uses
(OscLib oracle -> `numpy_ref` -> `nufast` -> `nuprobe`) by one rung, rather
than forking the physics.

## Run the test

```bash
node tests/js/test-engine.js
```

No dependencies. It checks four things:

1. **Golden agreement** — 3600 probabilities against `numpy_ref` across 40
   configurations: all three experiment baselines plus a 10 km and an
   Earth-diameter case, both mass orderings, neutrinos and antineutrinos,
   NSI on and off, at energies from 0.05 to 12 GeV. Tolerance 1e-10;
   measured agreement is ~7e-13.
2. **Unitarity** — rows and columns of P sum to 1 to <1e-12, with NSI on.
3. **No negative probabilities.**
4. **Vacuum limit** — with theta13 = 0 and dm21 = 0, P(numu->numu) reproduces
   the analytic two-flavour formula.

## Regenerate the golden file

Only needed when the upstream physics changes. Requires `nuosclab`
installed in the active environment:

```bash
pip install git+https://github.com/gavinsdavies/nuosclab
python tests/golden/generate_golden.py
```

Then re-run the test and commit both files together, so the golden file and
the engine it pins always move as a pair.

## Suggested CI

The site has no CI workflow today. If one is added, this is a two-line job:

```yaml
- uses: actions/setup-node@v6
  with: { node-version: '22' }
- run: node tests/js/test-engine.js
```
