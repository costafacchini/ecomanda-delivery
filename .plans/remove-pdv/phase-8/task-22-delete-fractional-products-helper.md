# Task: Delete FractionalProducts helper

**Plan**: Remove PDV Domain
**Phase**: 8
**Task Path**: phase-8/task-22-delete-fractional-products-helper
**Depends On**: phase-7/task-20-strip-licensee-pdv-fields, phase-7/task-21-strip-contact-pdv-fields
**JIRA**: N/A

## Objective

Delete `src/app/helpers/FractionalProducts.ts` and its test file `src/app/helpers/FractionalProducts.spec.ts`. This helper was only used by the PDV cart layer, which has already been deleted.

## Context

`FractionalProducts.ts` calculates whether a product quantity should be treated as fractional (decimal) or integer, a concept that only applied to PDV cart items. With the cart and order models removed, this helper is dead code.

> Risk: Run `grep -r "FractionalProducts" src/` before deleting to confirm no non-PDV callers remain.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Run grep to confirm no remaining callers of `FractionalProducts`
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/helpers/FractionalProducts.ts` | delete | Dead code — only used by PDV cart layer |
| `src/app/helpers/FractionalProducts.spec.ts` | delete | Test file for deleted helper |

## Implementation Steps

### Step 1: Grep for any remaining callers
Run `grep -r "FractionalProducts" src/`. If any callers exist outside of already-deleted PDV files, do not proceed — flag for review.

### Step 2: Delete the helper and its spec
Remove both `FractionalProducts.ts` and `FractionalProducts.spec.ts`.

### Step 3: Run tests
Confirm no test suite references the deleted file.

## Testing

- [ ] `npx jest` full suite passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] `FractionalProducts.ts` deleted
- [ ] `FractionalProducts.spec.ts` deleted
- [ ] No remaining imports confirmed by grep
- [ ] All tests pass
- [ ] Changes committed to `plan/remove-pdv/phase-8/task-22-delete-fractional-products-helper` branch
- [ ] Status updated in `status.md`
