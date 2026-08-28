import csv, os
import numpy as np
from nuosclab import PMNSParams, NSIParams, oscillation_probabilities

rows = []
# A deliberately awkward spread: both orderings, nu and nubar, NSI off/on,
# the three baselines plus a couple of extremes, and energies down where the
# matter term dominates (near-degenerate eigenvalues -> the hard case).
setups = []
for (L, rho) in [(810, 2.79), (1300, 2.848), (295, 2.6), (10, 1.0), (12742, 5.5)]:
    for anti in (False, True):
        for ordering in (+1, -1):
            for nsi_on in (False, True):
                setups.append((L, rho, anti, ordering, nsi_on))

energies = [0.05, 0.12, 0.3, 0.6, 1.0, 1.9, 2.5, 4.0, 7.5, 12.0]
for (L, rho, anti, ordering, nsi_on) in setups:
    pmns = PMNSParams(dm31=ordering * 2.515e-3)
    nsi = NSIParams(eps_emu=0.18, eps_etau=0.09, eps_mutau=0.06,
                    delta_emu=1.1, delta_etau=-2.3, delta_mutau=0.45) if nsi_on else NSIParams()
    E = np.array(energies)
    P = oscillation_probabilities(E, L, rho, pmns, nsi, anti)
    for n, e in enumerate(energies):
        for beta in range(3):
            for alpha in range(3):
                rows.append([L, rho, int(anti), ordering, int(nsi_on), e, beta, alpha,
                             repr(float(P[n, beta, alpha]))])

with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'nuosc_golden.csv'), 'w', newline='') as f:
    w = csv.writer(f)
    w.writerow(['L_km','rho_gcc','antineutrino','ordering','nsi_on','E_GeV','beta','alpha','P'])
    w.writerows(rows)
print('rows:', len(rows), 'setups:', len(setups))
