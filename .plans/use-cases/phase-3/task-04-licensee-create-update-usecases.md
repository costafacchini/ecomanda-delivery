# Task: Extract CreateLicensee and UpdateLicensee use cases

**Plan**: Use Cases
**Phase**: 3
**Task Path**: phase-3/task-04-licensee-create-update-usecases
**Depends On**: phase-1/task-01-scaffold-usecases-dir
**JIRA**: N/A

## Objective

Extract `CreateLicensee` and `UpdateLicensee` use cases from `LicenseesController`, each with a spec that runs without `mongoServer`.

## Context

`LicenseesController.create` maps 50+ fields before calling the repository. `LicenseesController.update` permits fields, serializes `pedidos10_integration`, then updates. Both use cases receive `{ licenseeRepository }` via constructor. The field-mapping logic moves from the controller into the use case's `execute()` method. Tests use `LicenseeRepositoryMemory`.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/usecases/licensees/CreateLicensee.js` | create | Maps 50+ fields, persists via repository |
| `src/app/usecases/licensees/CreateLicensee.spec.js` | create | Uses LicenseeRepositoryMemory |
| `src/app/usecases/licensees/UpdateLicensee.js` | create | Permits fields, serializes pedidos10_integration, updates |
| `src/app/usecases/licensees/UpdateLicensee.spec.js` | create | Uses LicenseeRepositoryMemory |

## Implementation Steps

### Step 1: Read LicenseesController.create and .update
Read `src/app/controllers/LicenseesController.js` to capture the exact field list and logic.

### Step 2: Create CreateLicensee
Constructor: `{ licenseeRepository }`. `execute(fields)` applies the full field mapping from the controller, then calls `this.licenseeRepository.create(...)`.

### Step 3: Create UpdateLicensee
Constructor: `{ licenseeRepository }`. `execute(id, fields)` applies field permissions, serializes `pedidos10_integration` if present, then calls `this.licenseeRepository.update(id, ...)`.

### Step 4: Write specs
Pre-seed `LicenseeRepositoryMemory` where needed. Assert that the created/updated record has the expected fields.

## Testing

- [ ] `npx jest src/app/usecases/licensees/` passes without mongoServer
- [ ] Existing tests still pass
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] `CreateLicensee.js` and `UpdateLicensee.js` exist with passing specs
- [ ] No field-mapping logic remains in `LicenseesController` (it is moved but not yet deleted from controller — slimming happens in task-06)
- [ ] Changes committed to `plan/use-cases/phase-3/task-04-licensee-create-update-usecases` branch
- [ ] Status updated in `status.md`
