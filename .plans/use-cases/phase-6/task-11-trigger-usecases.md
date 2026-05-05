# Task: Extract CreateTrigger, UpdateTrigger, ImportFacebookCatalog use cases

**Plan**: Use Cases
**Phase**: 6
**Task Path**: phase-6/task-11-trigger-usecases
**Depends On**: phase-1/task-01-scaffold-usecases-dir
**JIRA**: N/A

## Objective

Extract three trigger-domain use cases from `TriggersController`, eliminating the `new Trigger() + validateSync + save` antipattern and isolating the Facebook catalog import delegation.

## Context

- `CreateTrigger`: replaces `new Trigger() + validateSync + save` with `triggerRepository.create(fields)`.
- `UpdateTrigger`: replaces direct `Trigger.updateOne` with `triggerRepository.update(id, fields)`.
- `ImportFacebookCatalog`: delegates to `FacebookCatalogImporter`. Receives `{ facebookCatalogImporter }`.

Tests for `CreateTrigger` and `UpdateTrigger` use `TriggerRepositoryMemory`. `ImportFacebookCatalog` spec mocks the importer.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/usecases/triggers/CreateTrigger.js` | create | |
| `src/app/usecases/triggers/CreateTrigger.spec.js` | create | |
| `src/app/usecases/triggers/UpdateTrigger.js` | create | |
| `src/app/usecases/triggers/UpdateTrigger.spec.js` | create | |
| `src/app/usecases/triggers/ImportFacebookCatalog.js` | create | |
| `src/app/usecases/triggers/ImportFacebookCatalog.spec.js` | create | |

## Implementation Steps

### Step 1: Read TriggersController
Read `src/app/controllers/TriggersController.js` to capture field list, antipattern usages, and importer delegation.

### Step 2: Create use cases
Follow the repository pattern for Create/Update. `ImportFacebookCatalog.execute(licenseeId, catalogId)` delegates to `this.facebookCatalogImporter.import(...)`.

### Step 3: Write specs

## Testing

- [ ] `npx jest src/app/usecases/triggers/` passes without mongoServer
- [ ] Existing tests still pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No product or API documentation changes expected for this extraction alone
- [ ] If the importer-trigger orchestration pattern becomes reusable for later use-case extractions, capture it with `document-solution`
- [ ] If any KB files change, run `check-kb-index`

## Completion Criteria

- [ ] Three use case files and specs created and passing
- [ ] Changes committed to `plan/use-cases/phase-6/task-11-trigger-usecases` branch
- [ ] Status updated in `status.md`
