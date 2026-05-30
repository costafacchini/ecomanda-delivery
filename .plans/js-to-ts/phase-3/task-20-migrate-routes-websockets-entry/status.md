# Status: Migrate routes, websockets, and server entry to .ts

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
| 2026-05-30 | complete | claude-sonnet-4-6 | 12 route/websocket/entry files + 60 usecases/runtime files renamed; 2756 tests pass |

## Blockers

None

## Artifacts

None

## Adaptations

Task scope expanded to include all remaining .js files in src/app/usecases/ (29 files + cartErrors.ts) and src/app/runtime/dependencies.ts, which had no dedicated migration task. Added class field declarations and Record<string, any> constructor params to all 28 usecase classes. Typed dependencies container as Record<string, any>. Cast RedisStore sendCommand return as any in login-route.ts. Stripped .js extensions from all imports in newly-renamed .ts files and spec files.
