# SCORING FORMULAS

## Discipline Score (DS)
The Discipline Score is calculated as follows:
`DS = (A_c / A_t) * 100 - (L_e * 0.5)`

Where:
- `A_c`: Actions completed on time.
- `A_t`: Total actions planned.
- `L_e`: Execution lag (hours).

## Penalty Weights
- **Missed Action**: -10 points.
- **Late Action**: -2 to -5 points (based on lag).
- **Grace Period Recovery**: +1 point (capped).

## Integrity Check
Formulas are verified via snapshot tests. Any modification must maintain backwards compatibility or provide a migration path.
