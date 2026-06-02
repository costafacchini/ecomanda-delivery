# Status: Delete plugins/carts/ directory

**Current Status**: blocked
**Last Updated**: 2026-06-02
**Agent**: claude-sonnet-4-6
**Branch**: main
**PR**: —

## Status History

| Timestamp | Status | Agent | Notes |
|-----------|--------|-------|-------|
| 2026-04-28 | not-started | — | Task created |
| 2026-06-02 | in-progress | claude-sonnet-4-6 | Execution started |
| 2026-06-02 | blocked | claude-sonnet-4-6 | External consumers found in dependencies.ts, v1-routes.ts, v1-routes.spec.ts — see Blockers section |

## Blockers

**External consumers found — directory cannot be deleted yet.**

`grep -r "plugins/carts" src/ --include="*.ts" -l` returned 3 files outside `plugins/carts/` itself:

1. `src/app/runtime/dependencies.ts` (line 17)
   - `import { createCartPlugin as createCartPluginFactory } from '../plugins/carts/factory'`
   - `createCartPlugin` is wired into the dependency container and passed to route handlers

2. `src/app/routes/v1/v1-routes.ts` (line 28)
   - `import { createCartAdapter } from '../../plugins/carts/adapters/factory'`
   - Used to construct `CreateCart` use-case inside `cartsController`
   - Routes `/carts/*` are still mounted on this router

3. `src/app/routes/v1/v1-routes.spec.ts` (line 66)
   - `jest.mock('../../plugins/carts/adapters/factory', ...)`
   - Mirrors the production import in the test file

**Note**: `Dialog.ts` does NOT appear (task-26 strip was successful).

These files must have their cart references removed (or the cart routes/controller removed) before `plugins/carts/` can be deleted.

## Artifacts

None

## Adaptations

Task blocked. Deletion deferred until external consumers are cleaned up.
Files to address: `dependencies.ts`, `v1-routes.ts`, `v1-routes.spec.ts`.
