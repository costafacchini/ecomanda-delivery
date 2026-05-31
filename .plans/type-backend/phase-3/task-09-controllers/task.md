# Task: Controller Types

**Plan**: Backend Type Narrowing
**Phase**: 3
**Task ID (phase-local)**: task-09
**Task Path**: phase-3/task-09-controllers
**Depends On**: phase-2/task-06-message-contact-usecases, phase-2/task-07-remaining-usecases
**JIRA**: N/A

## Objective

Type all Express controllers in `src/app/controllers/`, replacing `any` on `req`, `res`, and use case dependency params with concrete types.

## Context

Controllers are the thinnest layer — they validate, call a use case, and respond. The 182 `any` occurrences here are mostly `req: any`, `res: any`, and `dependencies: any` constructor params.

Use `Request`, `Response` from `express` for handler parameters. Type the dependency injection object using the typed use case classes from Phase 2.

Read `docs/kb/architecture/express-conventions.md` before starting.

Files: all `*Controller.ts` in `src/app/controllers/`.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-2/task-06-message-contact-usecases` and `phase-2/task-07-remaining-usecases` are `complete`
- [ ] Read `docs/kb/architecture/express-conventions.md`
- [ ] `ls src/app/controllers/` to confirm the full file list
- [ ] Check this task's `status.md` and mark `in-progress` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/controllers/*.ts` | modify all | All controller files |

### Do NOT Modify

- `src/app/usecases/*` — Phase 2 ownership (complete)
- `src/app/routes/*` — not in scope for this task (route mounting is already typed via express)

## Implementation Steps

### Step 1: Type req and res

Replace `req: any, res: any` with `req: Request, res: Response` from express. Use `req.body as IMyRequestBody` where body shape is known, or define request body interfaces inline.

### Step 2: Type dependency injection params

Replace `{ messageRepository: any, licenseeRepository: any }` constructor params with the typed interfaces from Phase 2 use cases.

### Step 3: Type internal variables

Local variables that previously needed `as any` to call model methods should now type-flow from the use case return types.

### Step 4: Typecheck

`npx tsc --noEmit`. Fix only controller files.

## Testing

- [ ] `npx tsc --noEmit` passes
- [ ] `NODE_ENV=test npx jest --testPathPattern="controllers/" --no-coverage` — all pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] Update `docs/kb/architecture/express-conventions.md` to document the request body typing pattern if a reusable pattern is established

## Completion Criteria

- [ ] All controllers use `Request` / `Response` instead of `any`
- [ ] All constructor dependency params typed
- [ ] All controller tests pass
- [ ] Status updated in `status.md`
- [ ] Changes committed to `plan/type-backend/phase-3/task-09-controllers`
