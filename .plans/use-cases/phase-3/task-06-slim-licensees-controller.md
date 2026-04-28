# Task: Slim LicenseesController

**Plan**: Use Cases
**Phase**: 3
**Task Path**: phase-3/task-06-slim-licensees-controller
**Depends On**: phase-3/task-04-licensee-create-update-usecases, phase-3/task-05-licensee-external-action-usecases
**JIRA**: N/A

## Objective

Replace all business logic in `LicenseesController` with use case delegation calls. Update `resources-routes.js` to inject all five licensee use cases into the controller.

## Context

After tasks 04 and 05, all five licensee use cases exist. `LicenseesController` constructor changes to receive `{ createLicensee, updateLicensee, setDialogWebhook, sendLicenseeToPagarMe, signPedidos10OrderWebhook }`. Each method body becomes a single `execute()` call plus HTTP response handling.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/controllers/LicenseesController.js` | modify | Slim all methods to use case delegation |
| `src/app/routes/resources-routes.js` | modify | Wire all 5 use cases into LicenseesController |

## Implementation Steps

### Step 1: Slim LicenseesController
For each controller method (`create`, `update`, `setDialogWebhook`, `sendToPagarMe`, `signOrderWebhook`): replace body with `this.<useCase>.execute(...)` and appropriate HTTP response. Constructor receives the five use case instances.

### Step 2: Update resources-routes.js
Instantiate all five licensee use cases with their repository/plugin dependencies and pass them to `new LicenseesController(...)`.

### Step 3: Update LicenseesController.spec.js
Mock each use case. Assert that the controller calls `execute()` with the right arguments and returns the expected HTTP response.

## Testing

- [ ] `npx jest src/app/controllers/LicenseesController.spec.js` passes
- [ ] Existing tests still pass
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] No business logic remains in `LicenseesController`
- [ ] All five licensee use cases are wired in `resources-routes.js`
- [ ] Controller spec updated and passing
- [ ] Changes committed to `plan/use-cases/phase-3/task-06-slim-licensees-controller` branch
- [ ] Status updated in `status.md`
