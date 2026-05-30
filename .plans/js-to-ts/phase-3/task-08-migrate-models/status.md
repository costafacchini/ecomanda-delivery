# Status: Migrate Mongoose models to .ts

**Current Status**: complete
**Last Updated**: 2026-05-30
**Agent**: claude-sonnet-4-6
**Branch**: plan/js-to-ts/phase-1-tooling
**PR**: #2799

## Status History

| Timestamp | Status | Agent | Notes |
|-----------|--------|-------|-------|
| 2026-04-28 | not-started | — | Task created |
| 2026-05-30 | in-progress | claude-sonnet-4-6 | Started |
| 2026-05-30 | complete | claude-sonnet-4-6 | 15 model files + 14 specs renamed; 2756 tests pass; typecheck passes |

## Blockers

None

## Artifacts

None

## Adaptations

Added `(cart as any)` cast for calculateTotal() call in pre-save hook and typed post-save callback param as `any` (Mongoose method types not resolved at schema definition time). Typed `fieldsToUpdate` as `Record<string, string>` to allow property assignment. Feature plans (setores, baileys-socket-monitor, local-chat-infra) not yet merged — baseline 15 models migrated.
