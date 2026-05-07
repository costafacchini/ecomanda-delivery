# Task: Remove AWS Fields from Licensee — Use Env Vars

**Plan**: Licensee Form Wizard
**Task ID**: task-06
**Task Path**: phase-1/task-06-remove-aws
**Depends On**: None
**JIRA**: N/A

## Before You Start

- [ ] Verify env vars exist in `.env` / Heroku config: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET_NAME`
- [ ] Confirm `Backup.js` and `ClearBackups.js` already use these env vars (they do — verified during planning)
- [ ] Read `src/app/plugins/storage/S3.js` in full

## Context

`Backup.js` and `ClearBackups.js` already use `process.env.AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY/AWS_BUCKET_NAME`. Only `S3.js` (per-message file uploads) still reads credentials from the licensee document. Per-licensee AWS credentials create unnecessary config surface and UX complexity. Switch `S3.js` to env vars and remove the three fields from the model.

**Schema change**: `awsId`, `awsSecret`, `bucketName` removed from `Licensee`. Existing documents with these fields will simply have unread values — no migration needed (Mongoose ignores fields not in the schema).

**Frontend removal** of the form fields is handled by `task-01-panel-general` — this task is backend-only.

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/plugins/storage/S3.js` | modify | Read credentials from env vars, drop licensee param dependency |
| `src/app/models/Licensee.js` | modify | Remove `awsId`, `awsSecret`, `bucketName` fields |
| `src/app/usecases/licensees/CreateLicensee.js` | modify | Remove from allowed-fields list |
| `src/app/usecases/licensees/UpdateLicensee.js` | modify | Remove from allowed-fields list |
| `src/app/factories/licensee.js` | modify | Remove `awsId`, `awsSecret`, `bucketName` from factory |
| `src/app/models/Licensee.spec.js` | modify | Remove/update AWS field assertions |
| `src/app/queries/LicenseesQuery.spec.js` | modify | Remove/update AWS field assertions if present |
| `src/app/services/ResetChatbots.spec.js` | modify | Remove AWS fields from factory calls if present |

### Do NOT Modify

- `src/app/services/Backup.js` — already uses env vars, no change
- `src/app/services/ClearBackups.js` — already uses env vars, no change
- `client/src/pages/Licensees/scenes/Form/index.js` — owned by task-01
- Any `panels/` files — owned by task-01/02/03

## Conflict Avoidance Notes

Runs in parallel with task-01, task-02, task-03. No file overlap — backend-only task.

## Implementation Steps

### Step 1: Update S3.js

Replace licensee credential reads with env vars:

```js
this.aws = new S3Client({
  region: process.env.AWS_DEFAULT_REGION ?? 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

this.bucketName = process.env.AWS_BUCKET_NAME
```

The `licensee` constructor param may still be needed for `this.contact` path logic — keep it if used elsewhere; remove only the credential reads.

### Step 2: Remove fields from Licensee.js model

Remove the three field definitions from the schema:
- `awsId`
- `awsSecret`
- `bucketName`

### Step 3: Remove from CreateLicensee.js and UpdateLicensee.js

Both files have an allowed-fields array. Remove `'awsId'`, `'awsSecret'`, `'bucketName'` from each list.

### Step 4: Update factory and specs

- `factories/licensee.js`: remove the three fields
- `Licensee.spec.js`: remove assertions that reference these fields
- `LicenseesQuery.spec.js` and `ResetChatbots.spec.js`: remove any AWS field usage in test setup

### Step 5: Run tests

```bash
npx jest --testPathPattern="Licensee|S3|ResetChatbot"
```

## Testing

- [ ] All affected tests pass
- [ ] `npx jest` full suite passes
- [ ] `npx eslint .` passes
- [ ] Manual (if S3 upload path is reachable): verify file upload still works via env vars

## Documentation / KB Updates

No KB/doc updates required — straightforward env var migration following the pattern already established in Backup.js.

## Completion Criteria

- [ ] `S3.js` reads credentials from `process.env.*`
- [ ] `awsId`, `awsSecret`, `bucketName` removed from Licensee schema
- [ ] Removed from `CreateLicensee.js` and `UpdateLicensee.js` allowed-fields lists
- [ ] Factory and specs updated
- [ ] All tests pass
- [ ] `npx eslint .` passes
