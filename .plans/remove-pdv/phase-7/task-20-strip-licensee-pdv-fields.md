# Task: Remove PDV fields from Licensee schema

**Plan**: Remove PDV Domain
**Phase**: 7
**Task Path**: phase-7/task-20-strip-licensee-pdv-fields
**Depends On**: phase-6/task-18-delete-pdv-models-repositories, phase-6/task-19-delete-pdv-queries
**JIRA**: N/A

## Objective

Remove PDV-specific fields from the `Licensee` Mongoose schema: `cartDefault`, `useCartGallabox`, `recipient_id`, `pedidos10_active`, `pedidos10_integration`, `pedidos10_integrator`. Update `Licensee.spec.js` and `factories/licensee.js`.

## Context

> DB MIGRATION NOTE: These fields exist in production MongoDB documents. Provide a migration/script to unset them from existing records — do NOT run it directly. The schema change itself is safe to deploy first (Mongoose ignores unknown fields); the DB unset can follow.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Confirm with stakeholders that `cartDefault`, `recipient_id`, and `pedidos10_*` fields are safe to remove from production records
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/models/Licensee.js` | modify | Remove 6 PDV fields from schema |
| `src/app/models/Licensee.spec.js` | modify | Remove test cases for deleted fields |
| `src/app/factories/licensee.js` | modify | Remove PDV field defaults from factory |

## Implementation Steps

### Step 1: Read Licensee.js schema
Identify each PDV field definition.

### Step 2: Remove the 6 PDV fields from the schema object
Fields: `cartDefault`, `useCartGallabox`, `recipient_id`, `pedidos10_active`, `pedidos10_integration`, `pedidos10_integrator`.

### Step 3: Update Licensee.spec.js
Remove test cases that reference any of the deleted fields.

### Step 4: Update factories/licensee.js
Remove the PDV field defaults.

### Step 5: Run tests

## Testing

- [ ] `npx jest src/app/models/Licensee.spec.js` passes
- [ ] `npx jest` full suite passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] All 6 PDV fields removed from Licensee schema
- [ ] Spec and factory updated
- [ ] All tests pass
- [ ] DB migration script provided (not executed)
- [ ] Changes committed to `plan/remove-pdv/phase-7/task-20-strip-licensee-pdv-fields` branch
- [ ] Status updated in `status.md`
