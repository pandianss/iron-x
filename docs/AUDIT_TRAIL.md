# AUDIT TRAIL

## Requirement
Every state change in the discipline system must be logged with:
- Timestamp (UTC)
- Actor ID
- Action Type
- Previous State
- New State
- Enforcement Context

## Audit Integrity
Logs are append-only. No deletion or modification of audit records is permitted.

## Access
Internal diagnostics only. No public-facing "history" except for transparency reports.
