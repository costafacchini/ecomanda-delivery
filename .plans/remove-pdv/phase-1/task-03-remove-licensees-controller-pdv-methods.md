# Task: Remove sendToPagarMe and signOrderWebhook from LicenseesController

**Plan**: Remove PDV Domain
**Phase**: 1
**Task Path**: phase-1/task-03-remove-licensees-controller-pdv-methods
**Depends On**: None
**JIRA**: N/A

## Objective

Delete the `sendToPagarMe` and `signOrderWebhook` methods from `src/app/controllers/LicenseesController.ts` and remove all PagarMe and Pedidos10 imports from that file.

## Context

The routes calling these methods are being removed in task-02. This task removes the dead code from the controller class itself. Update `LicenseesController.spec.ts` to remove the corresponding test cases.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/controllers/LicenseesController.ts` | modify | Delete two methods + imports |
| `src/app/controllers/LicenseesController.spec.ts` | modify | Remove tests for deleted methods |

## Implementation Steps

### Step 1: Read LicenseesController.ts
Identify `sendToPagarMe`, `signOrderWebhook` method bodies and all PagarMe/Pedidos10 import lines.

### Step 2: Delete methods and imports
Remove the two method definitions and all associated plugin imports.

### Step 3: Update spec
Remove test cases for `sendToPagarMe` and `signOrderWebhook`.

### Step 4: Run tests

## Testing

- [ ] `npx jest src/app/controllers/LicenseesController.spec.ts` passes
- [ ] `npx jest` full suite passes
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] No `sendToPagarMe` or `signOrderWebhook` method in `LicenseesController`
- [ ] No PagarMe or Pedidos10 imports in `LicenseesController`
- [ ] Controller spec updated and passing
- [ ] Changes committed to `plan/remove-pdv/phase-1/task-03-remove-licensees-controller-pdv-methods` branch
- [ ] Status updated in `status.md`
