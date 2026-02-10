# Open Discipline Standard (ODS) v1.0 Specification

**Status:** APPROVED
**Date:** 2024-05-20 (Draft)

## 1. Introduction
The Open Discipline Standard (ODS) defines a universal protocol for recording, verifying, and enforcing execution reliability. It decouples the *intent* to act from the *tool* used to manage the act, enabling cross-platform discipline portability.

## 2. Core Entities

### 2.1. Intent Object
Represents a commitment to act.
```json
{
  "id": "uuid",
  "creator_id": "did:ods:user:...",
  "description": "string",
  "due_at": "ISO8601",
  "created_at": "ISO8601",
  "weight": "float (0.0 - 1.0)",
  "state": "PENDING | FROZEN | CANCELLED"
}
```

### 2.2. Action Object
Represents the proof of execution.
```json
{
  "id": "uuid",
  "intent_id": "uuid",
  "executed_at": "ISO8601",
  "proof_hash": "sha256(evidence)",
  "status": "VERIFIED"
}
```

### 2.3. Policy Object
Configuration for the Discipline Calculation Engine (DCE).
```json
{
  "id": "uuid",
  "strictness": "SOFT | HARD | SOVEREIGN",
  "window_size": "integer (hours)",
  "decay_rate": "float",
  "lockout_threshold": "float (0.0 - 1.0)"
}
```

## 3. Interfaces

### 3.1. Discipline Calculation Engine (DCE)
A compliant ODS implementation must provide a function `calculate_discipline(user_id, policy)` that returns a normalized score $D \in [0,1]$.

**Requirements:**
- **Determinism:** Given the same set of Intents and Actions, the score must be identical.
- **Immutability:** Past history cannot be altered to improve current score.

### 3.2. Enforcement Gate
A compliant ODS implementation must enforce lockouts.
- **Rule:** If $D < Policy.lockout\_threshold$ AND $CurrentTime > Intent.due\_at$, reject `create_intent()`.

## 4. Compliance Levels

### Level 1: Observer
- Records Intents and Actions.
- Calculates $D$.
- Does **NOT** enforce lockouts.

### Level 2: Enforcer
- All Level 1 features.
- actively blocks new Intents when $D$ drops below threshold.

### Level 3: Sovereign
- All Level 2 features.
- User cannot override Policy without cryptographic consensus or prolonged delay (Timelock).

## 5. Interoperability
Data export must follow the `ODS-JSON` schema (see `schema.json`).
