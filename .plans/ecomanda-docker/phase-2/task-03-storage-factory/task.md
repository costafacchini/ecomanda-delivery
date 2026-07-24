# Task: Wire Storage Factory in Base.ts

**Plan**: Ecomanda Docker Containerization
**Phase**: 2
**Task ID**: task-03
**Task Path**: phase-2/task-03-storage-factory
**Spec References**: Story 3 (P3), FR-006, SC-003, SC-004, SC-005
**Depends On**: phase-1/task-02-local-storage
**JIRA**: N/A

## Objective

Replace the hardcoded `new S3(...)` call in `Base.ts`'s `uploadFile` helper with a factory that returns `LocalStorage` or `S3` based on the `STORAGE_PROVIDER` env var.

## Context

`src/app/plugins/messengers/Base.ts` lines 7–11:

```typescript
const uploadFile = (licensee, contact, fileName, fileBase64) => {
  const s3 = new S3(licensee, contact, fileName, fileBase64)
  s3.uploadFile()
  return s3.presignedUrl()
}
```

This is the only place in the message flow where a storage object is instantiated (confirmed: `Dialog.ts` inherits `Base.ts`, `Backup.ts`/`ClearBackups.ts` are out of scope).

The factory replaces `new S3(...)` with a function that reads `process.env.STORAGE_PROVIDER`:
- `'local'` → `new LocalStorage(...)`
- anything else (including undefined) → `new S3(...)` (preserves existing default)

Both classes expose the same `uploadFile()` and `presignedUrl()` methods, so no other changes are needed in `Base.ts`.

**Repo**: `/Users/alan/Developer/pessoal/ecomanda-delivery`

## Before You Start

- [ ] Confirm task-02 is `complete` — `src/app/plugins/storage/Local.ts` must exist
- [ ] `cd /Users/alan/Developer/pessoal/ecomanda-delivery && git switch main && git pull`
- [ ] Read `src/app/plugins/messengers/Base.ts` lines 1–15 to confirm the current import and `uploadFile` function
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/plugins/messengers/Base.ts` | modify | Replace `new S3(...)` with factory |

### Do NOT Modify

- `src/app/plugins/storage/S3.ts` — no changes to existing S3 provider
- `src/app/plugins/storage/Local.ts` — owned by task-02
- `src/config/http.ts` — owned by task-02
- `docker-compose.yml`, `Dockerfile` — owned by task-04 / task-01

## Implementation Steps

### Step 1: Add `LocalStorage` import to `Base.ts`

At the top of `src/app/plugins/messengers/Base.ts`, add alongside the existing `S3` import:

```typescript
import { LocalStorage } from '../storage/Local'
```

### Step 2: Replace the hardcoded factory function

Replace:

```typescript
const uploadFile = (licensee: any, contact: any, fileName: any, fileBase64: any) => {
  const s3 = new S3(licensee, contact, fileName, fileBase64)
  s3.uploadFile()

  return s3.presignedUrl()
}
```

With:

```typescript
const createStorageProvider = (licensee: any, contact: any, fileName: any, fileBase64: any) => {
  if (process.env.STORAGE_PROVIDER === 'local') {
    return new LocalStorage(licensee, contact, fileName, fileBase64)
  }
  return new S3(licensee, contact, fileName, fileBase64)
}

const uploadFile = (licensee: any, contact: any, fileName: any, fileBase64: any) => {
  const storage = createStorageProvider(licensee, contact, fileName, fileBase64)
  storage.uploadFile()

  return storage.presignedUrl()
}
```

### Step 3: Verify TypeScript compiles

```bash
npx tsc --noEmit
```

## Testing

**Spec scenarios covered**:
- [ ] Scenario 3.1 — `STORAGE_PROVIDER=local` invokes `LocalStorage.uploadFile()` not S3
- [ ] Scenario 3.2 — `STORAGE_PROVIDER=s3` (or absent) invokes `S3.uploadFile()` unchanged

**Additional verification**:
- [ ] `npx tsc --noEmit` exits 0
- [ ] Existing test suite passes: `npm test`
- [ ] Manual test with `STORAGE_PROVIDER=local` (run after task-04 docker-compose is ready): upload a file and confirm it appears in `uploads/`

## Documentation / KB Updates

- [ ] After this task completes, run `document-solution` to create a KB doc covering the storage factory pattern — it introduces a reusable, non-obvious pattern.

## Completion Criteria

- [ ] `Base.ts` imports `LocalStorage` and uses `createStorageProvider` factory
- [ ] `STORAGE_PROVIDER=local` routes to `LocalStorage`; default routes to `S3`
- [ ] `npx tsc --noEmit` passes
- [ ] `npm test` passes with no regressions
- [ ] Changes committed on `plan/ecomanda-docker/phase-2/task-03-storage-factory` branch
- [ ] Status updated in `status.md`
