
# Iron-X // Zapier Integration Spec

**Objective:** Allow third-party tools (RescueTime, Focusmate, Toggl) to trigger Iron-X enforcement protocols or update Discipline Scores.

---

## Trigger Events (Iron-X -> ZAPIER)
1. **`discipline.breach`**: Triggered when a Hard Lockout is initialized.
2. **`score.update`**: Triggered daily for automated reporting.
3. **`witness.request`**: Triggered when an operator needs manual validation.

---

## Action Events (ZAPIER -> Iron-X)
1. **`initialize.lockout`**: Force a lockout based on external app signals (e.g., spent >2 hours on social media).
2. **`log.execution`**: Mark an action as completed from an external source.
3. **`update.tier`**: Programmatic trust tier adjustments.

---

## Auth Mechanism
- **Header:** `X-API-KEY: {IRON_X_KEY}`
- **Endpoint:** `https://api.iron-x.com/v1/integration/zapier`

---

// SYNC SUCCESSFUL.
