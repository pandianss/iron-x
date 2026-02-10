# STANDARD: Failure Taxonomy & Root Cause Analysis (ODS-FAIL-001)

## 1. Philosophy: The System is the Standard
Human willpower is a fluctuating resource and cannot be the basis of critical infrastructure. Therefore, "Human Error" in the context of execution reliability is actually a **System Design Failure**.

## 2. Reframed Failure Codes

| Traditional Code | Reframed System Code | description |
| :--- | :--- | :--- |
| **"Lack of Motivation"** | **ERR_SIGNAL_DECAY** | The system failed to provide high-frequency, inescapable feedback on inaction. |
| **"Forgot to do it"** | **ERR_VISIBILITY_LOSS** | The system permitted a commitment to exist without active, intrusive prompting. |
| **"Too busy / Overwhelmed"** | **ERR_UNBOUNDED_INPUT** | The system allowed the operator to accept new commitments while over capacity (Lack of Backpressure). |
| **"Procrastinated"** | **ERR_COST_LATENCY** | The immediate cost of inaction was too low or too delayed relative to the cost of action. |

## 3. Auditing "Absence of Enforcement"
When a failure occurs, the audit must ask:

1.  **Was the action temporally bound?** (If No: $PlanInvalid$)
2.  **Was the commitment visibly tracked?** (If No: $VisibilityFailure$)
3.  **Did the system intervene before the deadline?** (If No: $InterventionFailure$)
4.  **Was there a consequence for the miss?** (If No: $FeedbackLoopBroken$)

## 4. The "No-Blame" Requirement
Blaming an individual for a discipline failure is a security vulnerability. It hides the fact that the system allowed the failure to happen.
*   **Rule:** You cannot fire a person for a discipline failure until you have fixed the system that permitted it.
*   **Rule:** Reliability is an engineering problem, not a personnel problem.

## 5. Corrective Actions
Corrective actions must be **structural**, not **exhortational**.
*   *Invalid:* "Try harder next time."
*   *Invalid:* "Retrain on importance of X."
*   *Valid:* "Reduce active WIP limit to 3."
*   *Valid:* "Automate lockout after 2 hours of inactivity."
*   *Valid:* "Increase frequency of status checks to daily."
