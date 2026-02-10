# ARCHITECTURE DECISIONS (ADR)

## ADR-001: Structural Domain Hygiene
- **Date**: 2026-02-10
- **Status**: Accepted
- **Context**: Repository was organized by layers (server/client).
- **Decision**: Reorganize into system domains (/backend, /frontend, /docs, /tests) to reflect enforcement hierarchy.
- **Consequences**: Clear separation of enforcement logic and UI.

## ADR-002: Documentation as Policy
- **Date**: 2026-02-10
- **Status**: Accepted
- **Context**: Enforcement rules were implicit in code.
- **Decision**: Elevate documentation to primary policy status. Docs are reviewed like code.
- **Consequences**: Auditable and transparent enforcement logic.
