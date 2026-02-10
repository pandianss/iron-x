# Canonical Glossary: Operational Discipline Systems

**Version:** 1.0.0
**Status:** DRAFT

## 1. Fundamental Entities

### Intent
A formal declaration of a future action. An Intent must be specific, binary (done/not done), and time-bound.
*Example: "Submit report by Friday 5 PM".*

### Action
The verifiable execution of an Intent. An Action is an event in time, not a state.
*Example: The timestamped log of the report submission.*

### Constraint
A system rule that restricts the creation or state of Intents based on past behavior.
*Example: "Cannot create new Intents if Discipline Score < 0.8".*

## 2. Metrics

### Discipline Score ($D$)
A normalized value ($0.0 - 1.0$) representing the aggregate reliability of an entity over a rolling window.
*Canonical Formula:* $D = \frac{\sum (w_i \cdot c_i)}{N}$ where $c_i$ is compliance (1 or 0) and $w_i$ is weight.

### Execution Lag ($L$)
The time difference between the earliest possible start time ($t_{start}$) and the actual execution time ($t_{exec}$). Note: This differs from Lateness (relative to due date).

### Strictness Level
The degree of enforcement applied to a user.
- **Soft:** Warnings only.
- **Hard:** System lockouts (cannot create new tasks until overdue ones are cleared).
- **Sovereign:** Unlocked only by cryptographic proof of execution.

## 3. States

### Pending
The state of an Intent that is created but not yet due.

### Due
The state of an Intent within its active execution window.

### Overdue
The state of an Intent that has passed $t_{due}$ without Action.

### Frozen
A system state where no new Intents can be generated due to low Discipline Score.

## 4. Governance

### Policy
A configurable ruleset defining how Discipline Scores are calculated and what Constraints trigger at specific thresholds.

### Audit Log
An immutable record of all Intents, Actions, and State Changes, used to verify system integrity.
