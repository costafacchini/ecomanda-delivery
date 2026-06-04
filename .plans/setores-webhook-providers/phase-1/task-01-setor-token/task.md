# Task: Setor token field + webhook URL virtual

**Plan**: Setores — Webhook Providers
**Phase**: 1
**Task ID (phase-local)**: task-01
**Task Path**: phase-1/task-01-setor-token
**Depends On**: None (but requires `setores` plan fully merged to `main`)
**JIRA**: N/A

## Objective

Add a `setorToken` field (auto-generated UUID, unique) to the `Setor` model and a `webhookUrl` virtual that computes the full sector-scoped webhook URL. Expose the virtual in `SetoresController` by populating `licensee` in `show` and `index`.

## Context

`licensee.apiToken` is a UUID auto-generated via `uuidv4` as the Mongoose field default — follow the exact same pattern for `setorToken` on Setor.

The sector webhook URL format is:
```
https://clave-digital.herokuapp.com/api/v1/messenger/message/?token={licensee.apiToken}&setor={setor.setorToken}
```

This is analogous to the existing `urlChatWebhook`, `urlWhatsappWebhook` virtuals on `Licensee.ts` (see lines 206–219).

The virtual requires `licensee` to be populated to resolve `licensee.apiToken`. Use `this.populated('licensee')` to guard it. The controller's `show` and `index` must populate `licensee` so the virtual renders in API responses.

`Setor` model and `SetoresController` were created by `setores` plan task-01. Read those files in full before making changes.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Create task branch: `git switch -c plan/setores-webhook-providers/phase-1/task-01-setor-token`
- [ ] Verify `setores` plan is merged — confirm `src/app/models/Setor.ts` exists
- [ ] Read `src/app/models/Setor.ts` (full file)
- [ ] Read `src/app/controllers/SetoresController.ts` (full file)
- [ ] Read `src/app/models/Licensee.ts` lines 1–30 and 176–224 (apiToken field + virtual pattern)
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/models/Setor.ts` | modify | Add `setorToken` field + `webhookUrl` virtual |
| `src/app/models/Setor.spec.ts` | modify | Add token auto-generation and virtual tests |
| `src/app/controllers/SetoresController.ts` | modify | Populate `licensee` in `show` and `index` |
| `src/app/controllers/SetoresController.spec.ts` | modify | Assert `webhookUrl` appears in response |

### Do NOT Modify

- `src/app/routes/api-routes.ts` — owned by phase-2/task-02-auth-middleware
- `src/app/controllers/MessengersController.ts` — owned by phase-2/task-03-ingest-pipeline
- `src/app/usecases/webhooks/IngestMessengerMessage.ts` — owned by phase-2/task-03-ingest-pipeline
- `src/app/services/MessengerMessage.ts` — owned by phase-2/task-03-ingest-pipeline

## Implementation Steps

### Step 1: Add `setorToken` to `src/app/models/Setor.ts`

Import `uuidv4` (already a project dependency — see `Licensee.ts`):
```ts
import { v4 as uuidv4 } from 'uuid'
```

Add the field inside the schema definition (alongside `active`):
```ts
setorToken: { type: String, unique: true, default: uuidv4 },
```

### Step 2: Add `webhookUrl` virtual to `src/app/models/Setor.ts`

After the `pre('save')` hook and before `setorSchema.set('toJSON', ...)`:
```ts
setorSchema.virtual('webhookUrl').get(function () {
  if (!this.populated('licensee')) return null
  return `https://clave-digital.herokuapp.com/api/v1/messenger/message/?token=${(this.licensee as any).apiToken}&setor=${this.setorToken}`
})
```

Ensure `setorSchema.set('toJSON', { virtuals: true })` is already present (it should be from task-01 of the `setores` plan).

### Step 3: Populate `licensee` in `SetoresController`

In `SetoresController.ts`, update `show` and `index` to populate `licensee` so the `webhookUrl` virtual resolves:

```ts
// show
async show(req: any, res: any) {
  const setor = await this.setorRepository.findFirst({ _id: req.params.id }, ['licensee', 'users'])
  // ...
}

// index
async index(req: any, res: any) {
  const setores = await this.setorRepository.findAll({ licensee: req.query.licensee }, ['licensee', 'users'])
  // ...
}
```

Match the exact method signatures of the existing controller — read the file before editing.

## Testing

- [ ] `Setor` created without specifying `setorToken` — field is auto-populated with a UUID string
- [ ] Two `Setor` documents with the same `setorToken` — second save fails (unique index violation)
- [ ] `SetoresController.show` response includes `webhookUrl` with correct format `?token=...&setor=...`
- [ ] `SetoresController.show` response `webhookUrl` is `null` when licensee is not populated
- [ ] All existing Setor and SetoresController tests still pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB doc updates required at this task

## Completion Criteria

- [ ] `setorToken` field added with unique index and UUID default
- [ ] `webhookUrl` virtual added and resolves when `licensee` is populated
- [ ] `SetoresController.show` and `index` populate `licensee`
- [ ] All tests pass: `npx jest src/app/models/Setor.spec.ts src/app/controllers/SetoresController.spec.ts`
- [ ] `npx eslint src/app/models/Setor.ts src/app/controllers/SetoresController.ts` passes
- [ ] Changes committed to `plan/setores-webhook-providers/phase-1/task-01-setor-token` branch
- [ ] Status updated to `complete` in `status.md`

## Conflict Avoidance Notes

This is the only task in phase 1. Phase-2 tasks depend on `setorToken` existing — they must not start until this task is merged.
