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

## ADR-003: Iron-X as Technical Infrastructure
- **Date**: 2026-02-15
- **Status**: Accepted
- **Context**: System naming and positioning needed to reflect engineering-first philosophy.
- **Decision**: Adopt "Iron-X" as a technical descriptor representing deterministic enforcement infrastructure. Explicitly reject motivational/productivity framing.
- **Consequences**: Clear market positioning as governance infrastructure. See [TECHNICAL_RATIONALE.md](./TECHNICAL_RATIONALE.md) for full etymology.
