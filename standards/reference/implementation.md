# ODS Reference Implementation (Pseudocode)

**Version:** 1.0.0
**Type:** Logical Reference

## 1. Core Structures

```python
class Intent:
    id: UUID
    due_at: Timestamp
    status: Pending | Complete | Failed
    weight: Float

class Policy:
    window_days: Integer
    min_score_threshold: Float
    strictness: Soft | Hard
```

## 2. Discipline Calculation Engine (DCE)

The core function to determine the current `DisciplineScore`.

```python
FUNCTION CalculateDisciplineScore(user_history, policy):
    current_time = Now()
    window_start = current_time - policy.window_days

    # Filter events within the rolling window
    relevant_intents = Filter(user_history, i => i.due_at >= window_start)

    IF UseWeightedScoring:
        total_weight = Sum(relevant_intents.weight)
        earned_weight = Sum(relevant_intents WHERE status == Complete).weight
        RETURN earned_weight / total_weight
    ELSE:
        total_count = Count(relevant_intents)
        success_count = Count(relevant_intents WHERE status == Complete)
        RETURN success_count / total_count
```

## 3. Enforcement Logic

The gatekeeper function that decides if a new Intent can be created.

```python
FUNCTION CanCreateIntent(user, new_intent_request, policy):
    # 1. Check for Overdue items (Immediate blocker in Hard mode)
    overdue_items = GetOverdueIntents(user)
    IF policy.strictness == Hard AND Count(overdue_items) > 0:
        RETURN False, "Must clear overdue items first."

    # 2. Check Discipline Score (Systemic blocker)
    score = CalculateDisciplineScore(user.history, policy)
    IF score < policy.min_score_threshold:
        RETURN False, "Discipline Score too low. System Locked."

    RETURN True, "Authorized."
```

## 4. State Transition Logic

How an Intent moves from Pending to Final State.

```python
FUNCTION UpdateIntentState(intent, action_proof):
    IF action_proof.time <= intent.due_at:
        intent.status = Complete
    ELSE:
        intent.status = Failed # Or CompleteWithPenalty depending on config
    
    # Trigger Re-calculation
    user.score = CalculateDisciplineScore(user.history, user.policy)
```
