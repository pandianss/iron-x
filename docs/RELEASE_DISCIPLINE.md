# RELEASE DISCIPLINE

## Tagging Format
`v<major>.<minor>.<patch>`

## Versioning Rules
- **MAJOR**: Enforcement or policy model change (e.g., threshold adjustment, new lockout logic).
- **MINOR**: UI/Experience hardening (Phase 3.5) or non-enforcement features.
- **PATCH**: Correctness/Bug fixes only.

## Release Requirements
1. **Enforcement Impact Statement**: Must explicitly state how enforcement is affected.
2. **Policy Impact Statement**: Must list affected `PolicyID`s.
3. **Migration Steps**: Detailed instructions for data or state migration.
