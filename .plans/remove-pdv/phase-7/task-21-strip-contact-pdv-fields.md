# Task: Remove PDV fields from Contact schema

**Plan**: Remove PDV Domain
**Phase**: 7
**Task Path**: phase-7/task-21-strip-contact-pdv-fields
**Depends On**: phase-6/task-18-delete-pdv-models-repositories, phase-6/task-19-delete-pdv-queries
**JIRA**: N/A

## Objective

Remove delivery/address PDV fields from the `Contact` Mongoose schema: `address`, `address_number`, `address_complement`, `neighborhood`, `cep`, `delivery_tax`, `plugin_cart_id`, `address_id`. Update `Contact.spec.ts` and `factories/contact.ts`.

## Context

> DB MIGRATION NOTE: Same as task-20 — provide a script to unset these fields from production documents. Deploy schema change first, run unset script separately.

> Risk: Run `grep -r "contact.address\|\.cep\|\.neighborhood\|plugin_cart_id" src/` before removing — confirm no non-PDV code reads these fields.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Run grep to confirm no non-PDV callers read these fields
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/models/Contact.ts` | modify | Remove 8 PDV fields from schema |
| `src/app/models/Contact.spec.ts` | modify | Remove test cases for deleted fields |
| `src/app/factories/contact.ts` | modify | Remove PDV field defaults |

## Implementation Steps

### Step 1: Grep for any non-PDV usage of the 8 fields
If any usage is found outside of now-deleted PDV code, do not proceed — flag for review.

### Step 2: Remove the 8 PDV fields from the Contact schema

### Step 3: Update Contact.spec.ts and factories/contact.ts

### Step 4: Run tests

## Testing

- [ ] `npx jest src/app/models/Contact.spec.ts` passes
- [ ] `npx jest` full suite passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] All 8 PDV fields removed from Contact schema
- [ ] Spec and factory updated
- [ ] All tests pass
- [ ] DB migration script provided
- [ ] Changes committed to `plan/remove-pdv/phase-7/task-21-strip-contact-pdv-fields` branch
- [ ] Status updated in `status.md`
