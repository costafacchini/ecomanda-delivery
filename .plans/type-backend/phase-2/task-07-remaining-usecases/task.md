# Task: Remaining Use Case Types

**Plan**: Backend Type Narrowing
**Phase**: 2
**Task ID (phase-local)**: task-07
**Task Path**: phase-2/task-07-remaining-usecases
**Depends On**: phase-2/task-04-core-repositories, phase-2/task-05-remaining-repositories
**JIRA**: N/A

## Objective

Type the remaining use case classes — licensees, users, auth, triggers, onboarding, and widget — using the typed repositories from Phase 2.

## Context

Same pattern as task-06. Constructor dependency injection params and `execute()` signatures replace `any` with typed interfaces.

Note: backgroundjobs, orders, and carts use case directories were deleted by the `remove-pdv` plan (complete 2026-06-05). onboarding and widget were added subsequently.

Directories in scope:
- `src/app/usecases/licensees/`
- `src/app/usecases/users/`
- `src/app/usecases/auth/`
- `src/app/usecases/triggers/`
- `src/app/usecases/onboarding/`
- `src/app/usecases/widget/`

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-2/task-04-core-repositories` and `phase-2/task-05-remaining-repositories` are `complete`
- [ ] Read task-06 implementation for the use case typing pattern before starting
- [ ] Check this task's `status.md` and mark `in-progress` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/usecases/licensees/` | modify all | All licensee use cases |
| `src/app/usecases/users/` | modify all | All user use cases |
| `src/app/usecases/auth/` | modify all | Auth use cases |
| `src/app/usecases/triggers/` | modify all | Trigger use cases |
| `src/app/usecases/onboarding/` | modify all | Onboarding use cases |
| `src/app/usecases/widget/` | modify all | Widget use cases |

### Do NOT Modify

- `src/app/usecases/messages/`, `src/app/usecases/contacts/`, `src/app/usecases/webhooks/` — owned by phase-2/task-06

## Implementation Steps

Apply the same pattern established in task-06: type constructor dependency params and `execute()` signatures. Follow the convention from task-06 for consistency.

## Testing

- [ ] `npx tsc --noEmit` passes
- [ ] `NODE_ENV=test npx jest --testPathPattern="usecases/(licensees|users|auth|triggers|onboarding|widget)" --no-coverage` — all pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB/doc updates required

## Completion Criteria

- [ ] All in-scope use case classes typed (noting skipped PDV ones)
- [ ] All use case tests pass
- [ ] Status updated in `status.md`
- [ ] Changes committed to `plan/type-backend/phase-2`
