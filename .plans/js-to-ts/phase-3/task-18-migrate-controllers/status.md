# Status: Migrate controllers to .ts

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
| 2026-05-30 | complete | claude-sonnet-4-6 | 36 controller files renamed; 2756 tests pass |

## Blockers

None

## Artifacts

None

## Adaptations

Added class field declarations to all 17 controller classes. Fixed Date arithmetic in DashboardController (`endDate.getTime() - startDate.getTime()`). Typed all destructured constructor params as `Record<string, any>`.
