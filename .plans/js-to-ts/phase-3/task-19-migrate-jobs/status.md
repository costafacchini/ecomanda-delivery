# Status: Migrate jobs to .ts

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
| 2026-05-30 | complete | claude-sonnet-4-6 | 27 job files renamed; 2756 tests pass |

## Blockers

None

## Artifacts

None

## Adaptations

Minor call-site fix in ResetCarts, ResetChatbots, ResetChats where service functions were receiving an extra `data.body` arg they don't accept.
