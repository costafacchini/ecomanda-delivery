# Task: Message & Contact Use Case Types

**Plan**: Backend Type Narrowing
**Phase**: 2
**Task ID (phase-local)**: task-06
**Task Path**: phase-2/task-06-message-contact-usecases
**Depends On**: phase-2/task-04-core-repositories
**JIRA**: N/A

## Objective

Type the message and contact use case classes — their constructor parameters, `execute()` inputs, and return values — using the typed repositories and interfaces from Phase 1.

## Context

Use cases in `src/app/usecases/messages/` and `src/app/usecases/contacts/` are the highest-traffic domain layer. They receive repository instances via dependency injection (read `docs/kb/architecture/dependency-injection-runtime-wiring.md`).

The pattern: use case constructors accept `{ licenseeRepository: IRepository<ILicensee>, messageRepository: IRepository<IMessage>, ... }` — type these dependency objects. The `execute()` method's input shape and return type should be explicit.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-2/task-04-core-repositories` is `complete`
- [ ] Read `docs/kb/architecture/dependency-injection-runtime-wiring.md`
- [ ] Check this task's `status.md` and mark `in-progress` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/usecases/messages/` | modify all | Type all use case classes in this directory |
| `src/app/usecases/contacts/` | modify all | Type all use case classes in this directory |
| `src/app/usecases/webhooks/` | modify all | Webhook use cases that process messages |

### Do NOT Modify

- `src/app/usecases/licensees/` — owned by phase-2/task-07
- `src/app/usecases/users/`, `src/app/usecases/auth/` — owned by phase-2/task-07
- `src/app/usecases/triggers/`, `src/app/usecases/carts/`, `src/app/usecases/orders/` — owned by phase-2/task-07

## Implementation Steps

### Step 1: Define use case dependency types

For each use case class, replace the `{ licenseeRepository: any, messageRepository: any }` constructor param with a typed object. Use `IRepository<ILicensee>` etc. from task-04.

### Step 2: Type execute() inputs and outputs

Replace `execute(input: any)` with a typed interface. Define the input shape inline or as a named type in the same file. Return types should be specific (e.g., `Promise<IMessage | null>`).

### Step 3: Type internal variables

Where local variables are typed as `any` via assignment from repo calls, the type should now flow automatically from the typed repository. Remove explicit `any` annotations.

### Step 4: Typecheck

`npx tsc --noEmit`. Fix errors only within owned files.

## Testing

- [ ] `npx tsc --noEmit` passes
- [ ] `NODE_ENV=test npx jest --testPathPattern="usecases/(messages|contacts|webhooks)" --no-coverage` — all pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB/doc updates required

## Completion Criteria

- [ ] All message, contact, and webhook use case classes typed
- [ ] No `any` in constructor dependency params or `execute()` signatures
- [ ] All use case tests pass
- [ ] Status updated in `status.md`
- [ ] Changes committed to `plan/type-backend/phase-2/task-06-message-contact-usecases`
