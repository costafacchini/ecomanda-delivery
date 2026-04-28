# Task: Verify no remaining PDV imports

**Plan**: Remove PDV Domain
**Phase**: 8
**Task Path**: phase-8/task-25-verify-no-remaining-pdv-imports
**Depends On**: phase-8/task-24-delete-pdv-factories
**JIRA**: N/A

## Objective

Grep the entire codebase for any remaining imports of deleted PDV modules. Fix or remove each one. This is the final verification gate before the plan is considered complete.

## Context

After all previous phases have deleted PDV routes, controllers, use cases, models, repositories, queries, helpers, schema fields, and factories, this task performs a comprehensive sweep to catch any stray references that may have been missed. A clean grep result is the completion signal for the entire remove-pdv plan.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete (i.e., all phase-1 through phase-8 task-24 tasks)
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| Any file with a stray PDV import | modify or delete | Fix each hit individually |

## Implementation Steps

### Step 1: Grep for deleted PDV model names
```bash
grep -r "Cart\|Order\|Product\|Integrationlog\|BackgroundJob\|Billing\b" src/ \
  --include="*.js" --include="*.ts" -l
```
Review each match. Ignore legitimate non-PDV uses of generic names (e.g., `Order` in a different context). Focus on imports from deleted module paths.

### Step 2: Grep for deleted PDV module paths
```bash
grep -r \
  "models/Cart\|models/Order\|models/Product\|models/Integrationlog\|models/BackgroundJob\|models/Billing\|repositories/Cart\|repositories/Order\|repositories/Product\|queries/Billing\|queries/Integrationlog\|helpers/FractionalProducts\|parseCart" \
  src/
```
Every hit must be resolved before marking this task complete.

### Step 3: Grep for deleted PDV route/controller paths
```bash
grep -r \
  "routes/pdv\|controllers/pdv\|usecases/pdv\|pedidos10\|plugin_cart_id\|recipient_id\|cartDefault\|useCartGallabox" \
  src/
```

### Step 4: Fix each remaining reference
For each hit: remove the import line, delete the referencing file if it is itself dead code, or flag for manual review if the reference is unexpected.

### Step 5: Run full test suite and pre-commit-check

## Testing

- [ ] All grep commands above return zero results
- [ ] `npx jest` full suite passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] Zero grep hits for any deleted PDV module
- [ ] All tests pass
- [ ] Changes committed to `plan/remove-pdv/phase-8/task-25-verify-no-remaining-pdv-imports` branch
- [ ] Status updated in `status.md`
- [ ] Remove-PDV plan `overview.md` status updated to `complete`
