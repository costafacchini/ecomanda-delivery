# Task: Scaffold usecases directory structure

**Plan**: Use Cases
**Phase**: 1
**Task Path**: phase-1/task-01-scaffold-usecases-dir
**Depends On**: None
**JIRA**: N/A

## Objective

Create the `src/app/usecases/` directory tree mirroring the domain folder names used by controllers and repositories, so subsequent tasks have a stable home for use case files.

## Context

The DI plan is complete and repositories are injectable. Use cases will live under `src/app/usecases/` with one sub-directory per domain: `auth/`, `licensees/`, `contacts/`, `users/`, `triggers/`, `orders/`, `backgroundjobs/`, `webhooks/`. No source files are added in this task — only the structure and a `.gitkeep` or index barrel per folder to make the directories trackable.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/usecases/auth/.gitkeep` | create | placeholder |
| `src/app/usecases/licensees/.gitkeep` | create | placeholder |
| `src/app/usecases/contacts/.gitkeep` | create | placeholder |
| `src/app/usecases/users/.gitkeep` | create | placeholder |
| `src/app/usecases/triggers/.gitkeep` | create | placeholder |
| `src/app/usecases/orders/.gitkeep` | create | placeholder |
| `src/app/usecases/backgroundjobs/.gitkeep` | create | placeholder |
| `src/app/usecases/webhooks/.gitkeep` | create | placeholder |

## Implementation Steps

### Step 1: Create directory tree
Create each sub-directory under `src/app/usecases/` with a `.gitkeep` file so the empty directories are committed.

## Testing

- [ ] Existing tests still pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No product or API documentation changes expected for directory scaffolding alone
- [ ] If the implementation uncovers a non-obvious wiring pattern for future use case tasks, capture it with `document-solution`
- [ ] If any KB files change, run `check-kb-index`

## Completion Criteria

- [ ] `src/app/usecases/` exists with 8 domain sub-directories
- [ ] All directories are tracked in git
- [ ] Changes committed to `plan/use-cases/phase-1/task-01-scaffold-usecases-dir` branch
- [ ] Status updated in `status.md`
