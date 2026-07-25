# Task: Implement LocalStorage Provider

**Plan**: Ecomanda Docker Containerization
**Phase**: 1
**Task ID**: task-02
**Task Path**: phase-1/task-02-local-storage
**Spec References**: Story 1 (P1), Story 3 (P3), FR-004, FR-005, FR-007, FR-008, SC-003
**Depends On**: None
**JIRA**: N/A

## Objective

Create `src/app/plugins/storage/Local.ts` implementing the same `uploadFile()` / `presignedUrl()` interface as `S3.ts`, storing files on the local filesystem. Add an Express static route to serve those files. Update `.env.example`.

## Context

`S3.ts` (`src/app/plugins/storage/S3.ts`) is the only storage provider. It exposes two methods:
- `uploadFile()` — uploads a base64-encoded file to S3
- `presignedUrl()` — returns a public URL for the uploaded file

`LocalStorage` must match this interface exactly so task-03 can swap them transparently in `Base.ts`.

**File path convention** (mirroring S3's `getBucketPath`):
```
<LOCAL_STORAGE_PATH>/<YYYY-M-D>/<contact.number>/<fileName>
```
Default `LOCAL_STORAGE_PATH`: `/app/uploads`

**Public URL** (via `APP_URL` env var):
```
<APP_URL>/uploads/<YYYY-M-D>/<contact.number>/<fileName>
```

**Static route**: Express must serve `LOCAL_STORAGE_PATH` at `/uploads`. This goes in `src/config/http.ts` (the Express app config file).

**Repo**: `/Users/alan/Developer/pessoal/ecomanda-delivery`

## Before You Start

- [ ] `cd /Users/alan/Developer/pessoal/ecomanda-delivery && git switch main && git pull`
- [ ] Read `src/app/plugins/storage/S3.ts` in full — understand `getBucketPath`, `base64ToBuffer`, `uploadFile`, `presignedUrl`
- [ ] Read `src/config/http.ts` to find where to add the static route
- [ ] Confirm `fs` and `path` are available (Node built-ins, no install needed)
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/plugins/storage/Local.ts` | create | LocalStorage class |
| `src/app/plugins/storage/Local.spec.ts` | create | Jest test stubs |
| `src/config/http.ts` | modify | Add `/uploads` static route (only when `STORAGE_PROVIDER=local`) |
| `.env.example` | modify | Add STORAGE_PROVIDER, APP_URL, LOCAL_STORAGE_PATH |

### Do NOT Modify

- `src/app/plugins/storage/S3.ts` — S3 provider unchanged
- `src/app/plugins/messengers/Base.ts` — owned by task-03
- `Dockerfile`, `docker-compose.yml` — owned by task-01 / task-04

## Implementation Steps

### Step 1: Create `src/app/plugins/storage/Local.ts`

```typescript
import fs from 'fs'
import path from 'path'
import { logger } from '../../helpers/logger'

const LOCAL_STORAGE_PATH = process.env.LOCAL_STORAGE_PATH ?? '/app/uploads'
const APP_URL = process.env.APP_URL ?? 'http://localhost:5000'

const getFilePath = (contactNumber: any, fileName: string) => {
  const date = new Date()
  const folder = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
  return path.join(folder, String(contactNumber), fileName)
}

const base64ToBuffer = (fileBase64: string) => {
  let data = fileBase64
  if (data.indexOf(',') > -1) data = data.substr(data.indexOf(',') + 1)
  return Buffer.from(data, 'base64')
}

class LocalStorage {
  licensee: any
  contact: any
  fileName: string
  fileBase64: string
  _relativePath: string

  constructor(licensee: any, contact: any, fileName: string, fileBase64: string) {
    this.licensee = licensee
    this.contact = contact
    this.fileName = fileName
    this.fileBase64 = fileBase64
    this._relativePath = getFilePath(contact.number, fileName)
  }

  async uploadFile() {
    const fullPath = path.join(LOCAL_STORAGE_PATH, this._relativePath)
    fs.mkdirSync(path.dirname(fullPath), { recursive: true })
    fs.writeFileSync(fullPath, base64ToBuffer(this.fileBase64))
    logger.info(`LocalStorage: arquivo salvo em ${fullPath}`)
  }

  async presignedUrl(): Promise<string> {
    return `${APP_URL}/uploads/${this._relativePath}`
  }
}

export { LocalStorage }
```

### Step 2: Add `/uploads` static route to `src/config/http.ts`

Find where `app.use(express.static(...))` is called. Add after the existing static routes:

```typescript
import path from 'path'

// Serve locally-stored uploads when STORAGE_PROVIDER=local
if (process.env.STORAGE_PROVIDER === 'local') {
  const localStoragePath = process.env.LOCAL_STORAGE_PATH ?? '/app/uploads'
  app.use('/uploads', express.static(localStoragePath))
}
```

### Step 3: Update `.env.example`

Add to the existing AWS block:

```
STORAGE_PROVIDER=local       # local | s3 (default: s3)
LOCAL_STORAGE_PATH=/app/uploads  # only used when STORAGE_PROVIDER=local
APP_URL=http://localhost:5000    # used by LocalStorage to build public file URLs
```

### Step 4: Create `src/app/plugins/storage/Local.spec.ts`

```typescript
import { LocalStorage } from './Local'

describe('LocalStorage', () => {
  const licensee = { _id: 'lic1' }
  const contact = { number: '5511999990001' }
  const fileName = 'test.jpg'
  const fileBase64 = 'data:image/jpeg;base64,/9j/abc123'

  describe('uploadFile', () => {
    it.todo('saves the decoded base64 file to LOCAL_STORAGE_PATH/<date>/<number>/<fileName>')
    it.todo('creates intermediate directories if they do not exist')
    it.todo('strips the data URI prefix before writing')
  })

  describe('presignedUrl', () => {
    it.todo('returns APP_URL/uploads/<date>/<number>/<fileName>')
    it.todo('uses http://localhost:5000 as default APP_URL when env var is not set')
  })
})
```

## Testing

**Spec scenarios covered**:
- [ ] Scenario 1.3 — File stored on local volume: `uploadFile()` writes to `LOCAL_STORAGE_PATH`; `presignedUrl()` returns correct URL
- [ ] Scenario 3.1 — STORAGE_PROVIDER=local uses LocalStorage (verified end-to-end in task-03)

**Additional verification**:
- [ ] `npx tsc --noEmit` passes after adding `Local.ts`
- [ ] `npm test -- Local.spec` runs without errors (stubs remain pending/todo)

## Documentation / KB Updates

No KB/doc updates required. Run `document-solution` after task-03 completes the full storage factory — that's the better moment to document the overall pattern.

## Completion Criteria

- [ ] `src/app/plugins/storage/Local.ts` exists and compiles
- [ ] `/uploads` static route added to `src/config/http.ts`
- [ ] `.env.example` updated with the three new vars
- [ ] `Local.spec.ts` created with pending test stubs
- [ ] Changes committed on `plan/ecomanda-docker/phase-1/task-02-local-storage` branch
- [ ] Status updated in `status.md`
