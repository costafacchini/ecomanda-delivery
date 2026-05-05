# Task: WhatsappSession Model + Licensee Schema

**Plan**: Baileys WhatsApp Plugin
**Phase**: 1
**Task ID (phase-local)**: task-01
**Task Path**: phase-1/task-01-data-model
**Depends On**: None
**JIRA**: N/A

## Objective

Create the `WhatsappSession` Mongoose model that stores Baileys auth state (creds + keys) per licensee, and update the `Licensee` model to accept `'baileys'` as a valid `whatsappDefault` value without requiring `whatsappToken`/`whatsappUrl`.

## Context

Baileys stores authentication state as two JSON objects: `creds` (credentials) and `keys` (signal key store). These must persist across restarts. Each licensee gets exactly one session, so the model holds a unique `licensee` reference.

The existing Licensee schema (`src/app/models/Licensee.js`) has:
- `whatsappDefault` enum: `['utalk', 'dialog', 'ycloud', 'pabbly', '']` — needs `'baileys'` added
- `whatsappToken` required when `!!whatsappDefault` — must exclude `baileys`
- `whatsappUrl` required when `!!whatsappDefault` — must exclude `baileys`
- `pre('save')` hook auto-sets `whatsappUrl` for known providers — no URL to set for `baileys`

Follow the Contact model (`src/app/models/Contact.js`) as a pattern for model structure.
Follow `src/app/models/index.js` import pattern (side-effect import, no named export needed).

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Create task branch: `git switch -c plan/baileys-plugin/phase-1/task-01-data-model`
- [ ] Verify no other tasks are in-progress on overlapping files
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/models/WhatsappSession.js` | create | New model |
| `src/app/models/Licensee.js` | modify | Enum + validators only |
| `src/app/models/index.js` | modify | Add side-effect import |

### Do NOT Modify

- Any repository file — owned by phase-2/task-02-repository
- Any plugin file — owned by phase-3/task-03-plugin
- `src/app/repositories/testing.js` — owned by phase-2/task-02-repository

## Implementation Steps

### Step 1: Create WhatsappSession model

Create `src/app/models/WhatsappSession.js`:

```js
import mongoose from 'mongoose'

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const whatsappSessionSchema = new Schema(
  {
    _id: ObjectId,
    licensee: {
      type: ObjectId,
      ref: 'Licensee',
      required: [true, 'Licensee: Você deve preencher o campo'],
      unique: true,
    },
    creds: { type: Object },
    keys: { type: Object },
  },
  { timestamps: true },
)

whatsappSessionSchema.pre('save', function () {
  if (!this._id) {
    this._id = new mongoose.Types.ObjectId()
  }
})

whatsappSessionSchema.set('toJSON', { virtuals: true })

const WhatsappSession = mongoose.model('WhatsappSession', whatsappSessionSchema)

export default WhatsappSession
```

### Step 2: Update Licensee.js

Two changes only:

**a) Add `'baileys'` to enum (line ~60):**
```js
whatsappDefault: {
  type: String,
  enum: ['utalk', 'dialog', 'ycloud', 'pabbly', 'baileys', ''],
},
```

**b) Update `whatsappToken` and `whatsappUrl` required validators to exclude `'baileys'`:**
```js
whatsappToken: {
  type: String,
  required: [
    function () {
      return !!this.whatsappDefault && this.whatsappDefault !== 'baileys'
    },
    'Token de Whatsapp: deve ser preenchido quando tiver um plugin configurado',
  ],
},
whatsappUrl: {
  type: String,
  required: [
    function () {
      return !!this.whatsappDefault && this.whatsappDefault !== 'baileys'
    },
    'URL de Whatsapp: deve ser preenchido quando tiver um plugin configurado',
  ],
},
```

No change to the `pre('save')` hook — `baileys` has no auto-URL.

### Step 3: Update models/index.js

Add side-effect import:
```js
import './WhatsappSession.js'
```

## Testing

- [ ] Run `npx jest src/app/models/Licensee.spec.js` — existing tests must pass
- [ ] Manually verify: create a Licensee with `whatsappDefault: 'baileys'` and no token/URL — should not throw validation error
- [ ] Manually verify: create a Licensee with `whatsappDefault: 'dialog'` and no token — should still throw
- [ ] `npx eslint src/app/models/` passes clean

## Documentation / KB Updates

No KB/doc updates required — model follows established pattern.

## Completion Criteria

- [ ] `WhatsappSession.js` model created with `licensee` (unique ref), `creds`, `keys` fields
- [ ] `Licensee.js` enum includes `'baileys'`
- [ ] `whatsappToken`/`whatsappUrl` validators exclude `baileys`
- [ ] `models/index.js` imports `WhatsappSession`
- [ ] Existing Licensee model tests pass
- [ ] ESLint clean on modified files
- [ ] Changes committed to `plan/baileys-plugin/phase-1/task-01-data-model`
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

No parallel tasks in Phase 1 — this is the only task.
