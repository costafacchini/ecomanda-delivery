# Task: Extract SetDialogWebhook, SendLicenseeToPagarMe, SignPedidos10OrderWebhook use cases

**Plan**: Use Cases
**Phase**: 3
**Task Path**: phase-3/task-05-licensee-external-action-usecases
**Depends On**: phase-1/task-01-scaffold-usecases-dir
**JIRA**: N/A

## Objective

Extract three licensee external-action use cases from `LicenseesController`, each with a spec that runs without `mongoServer`.

## Context

- `SetDialogWebhook`: finds a licensee, conditionally calls a messenger plugin webhook. Receives `{ licenseeRepository, messengerPlugin }`.
- `SendLicenseeToPagarMe`: finds a licensee, creates or updates a PagarMe recipient. Receives `{ licenseeRepository, pagarMePlugin }`.
- `SignPedidos10OrderWebhook`: finds a licensee, calls `Pedidos10.signOrderWebhook`. Receives `{ licenseeRepository, pedidos10Plugin }`.

Specs mock the external plugin dependencies so no real HTTP calls are made.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/usecases/licensees/SetDialogWebhook.js` | create | |
| `src/app/usecases/licensees/SetDialogWebhook.spec.js` | create | |
| `src/app/usecases/licensees/SendLicenseeToPagarMe.js` | create | |
| `src/app/usecases/licensees/SendLicenseeToPagarMe.spec.js` | create | |
| `src/app/usecases/licensees/SignPedidos10OrderWebhook.js` | create | |
| `src/app/usecases/licensees/SignPedidos10OrderWebhook.spec.js` | create | |

## Implementation Steps

### Step 1: Read the three controller methods
Read `LicenseesController.setDialogWebhook`, `sendToPagarMe`, and `signOrderWebhook` to capture exact logic.

### Step 2: Create each use case
Follow the pattern: constructor receives repository + plugin dependency; `execute(id, ...params)` retrieves the licensee then delegates to the plugin.

### Step 3: Write specs
Use `LicenseeRepositoryMemory` for the repository. Mock the plugin dependency with a jest stub. Assert the correct plugin method is called with the correct arguments.

## Testing

- [ ] All three specs pass without mongoServer
- [ ] Existing tests still pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No product or API documentation changes expected for this extraction alone
- [ ] If the plugin-invocation or webhook-signing pattern becomes reusable for later use-case extractions, capture it with `document-solution`
- [ ] If any KB files change, run `check-kb-index`

## Completion Criteria

- [ ] Three use case files and three spec files created and passing
- [ ] Changes committed to `plan/use-cases/phase-3/task-05-licensee-external-action-usecases` branch
- [ ] Status updated in `status.md`
