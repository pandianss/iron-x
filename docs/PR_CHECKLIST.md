# PULL REQUEST GATEKEEPING CHECKLIST

To be completed by the Repository Steward before any merge to `develop` or `main`.

## Mandatories
- [ ] Single purpose PR (no scope creep).
- [ ] Enforcement logic unaffected or explicitly justified.
- [ ] No motivational language in UI strings.
- [ ] No "gamification" artifacts (badges, streaks, etc.) introduced.
- [ ] All tests passed (Deterministic & Property-based).
- [ ] Documentation updated in `/docs` if behavioral changes occur.

## Integrity Checks
- [ ] Discipline score formula unchanged or approved.
- [ ] Policy checksums verified.
- [ ] Enforcement thresholds preserved.

## Hard Blocks
- [ ] PR softens enforcement under user pressure.
- [ ] PR hides failure states.
- [ ] PR treats discipline as optional preference.
