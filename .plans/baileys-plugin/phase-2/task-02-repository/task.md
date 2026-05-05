# Task: WhatsappSession Repository

**Plan**: Baileys WhatsApp Plugin
**Phase**: 2
**Task ID (phase-local)**: task-02
**Task Path**: phase-2/task-02-repository
**Depends On**: phase-1/task-01-data-model
**JIRA**: N/A

## Objective

Create `WhatsappSessionRepositoryDatabase` and `WhatsappSessionRepositoryMemory`, wire them into `repositories/index.js` and `repositories/testing.js` following the established pattern.

## Context

Every repository in this project has two variants:
- `*RepositoryDatabase` — wraps the Mongoose model, used in production
- `*RepositoryMemory` — extends `RepositoryMemory` from `repository.js`, used in tests

Reference pattern: `src/app/repositories/contact.js` (simple repo, no extra query methods needed for initial scope).

`repositories/testing.js` is the central test harness. It:
1. Creates in-memory state arrays in `createMemoryRepositories()`
2. Instantiates all Memory repos and wires them
3. In `installMemoryRepositories()`, sets `modelClass`, `relationLoaders`, binds prototypes, and patches model statics

The `WhatsappSessionRepository` needs:
- `modelClass = WhatsappSession`
- `relationLoaders = { licensee: loadRelation(licenseeRepository) }`
- Prototype binding to `WhatsappSessionRepositoryDatabase.prototype`
- Model binding to `WhatsappSession` model

## Before You Start

- [ ] Verify `phase-1/task-01-data-model` status is `complete` — `WhatsappSession` model must exist
- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Create task branch: `git switch -c plan/baileys-plugin/phase-2/task-02-repository`
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/repositories/whatsappsession.js` | create | Database + Memory variants |
| `src/app/repositories/index.js` | modify | Add side-effect import |
| `src/app/repositories/testing.js` | modify | Wire into memory harness |

### Do NOT Modify

- `src/app/models/WhatsappSession.js` — owned by phase-1/task-01-data-model
- `src/app/models/Licensee.js` — owned by phase-1/task-01-data-model
- `src/app/plugins/messengers/Baileys.js` — owned by phase-3/task-03-plugin

## Implementation Steps

### Step 1: Create whatsappsession.js repository

Create `src/app/repositories/whatsappsession.js`:

```js
import Repository, { RepositoryMemory } from './repository.js'
import WhatsappSession from '../models/WhatsappSession.js'

class WhatsappSessionRepositoryDatabase extends Repository {
  model() {
    return WhatsappSession
  }
}

class WhatsappSessionRepositoryMemory extends RepositoryMemory {}

export { WhatsappSessionRepositoryDatabase, WhatsappSessionRepositoryMemory }
```

If a `findByLicensee(licenseeId)` helper is needed by the plugin later, it can be added in Phase 3. Keep this task minimal.

### Step 2: Update repositories/index.js

Add side-effect import:
```js
import './whatsappsession.js'
```

### Step 3: Update repositories/testing.js

Three locations to update:

**a) Add import at top (with other repository imports):**
```js
import WhatsappSession from '../models/WhatsappSession.js'
import { WhatsappSessionRepositoryDatabase, WhatsappSessionRepositoryMemory } from './whatsappsession.js'
```

**b) Add `whatsappSessions` array to `state` in `createMemoryRepositories()` and return the repo:**
```js
const state = {
  // ...existing keys...
  whatsappSessions: [],
}
// ...
return {
  // ...existing repos...
  whatsappSessionRepository: new WhatsappSessionRepositoryMemory(state.whatsappSessions),
}
```

**c) Add wiring in `installMemoryRepositories()`** — four additions matching the pattern of every other repo:

```js
// modelClass
repositories.whatsappSessionRepository.modelClass = WhatsappSession

// relationLoaders
repositories.whatsappSessionRepository.relationLoaders = {
  licensee: loadRelation(repositories.licenseeRepository),
}

// bindRepositoryPrototype
bindRepositoryPrototype(WhatsappSessionRepositoryDatabase.prototype, repositories.whatsappSessionRepository, restores)

// patchMember model()
patchMember(
  WhatsappSessionRepositoryDatabase.prototype,
  'model',
  () => createMemoryModelAdapter(repositories.whatsappSessionRepository),
  restores,
)

// bindModelToRepository
bindModelToRepository(WhatsappSession, repositories.whatsappSessionRepository, restores)
```

## Testing

- [ ] Run existing repository tests: `npx jest src/app/repositories/` — all must pass
- [ ] Run `npx jest src/app/plugins/messengers/Dialog.spec.js` — must still pass (verifies testing.js change is non-breaking)
- [ ] `npx eslint src/app/repositories/` passes clean

## Documentation / KB Updates

No KB/doc updates required — pattern is identical to all other repositories.

## Completion Criteria

- [ ] `whatsappsession.js` created with Database and Memory variants
- [ ] `repositories/index.js` imports `whatsappsession.js`
- [ ] `repositories/testing.js` wired: state array, repo instance, modelClass, relationLoaders, bindRepositoryPrototype, patchMember, bindModelToRepository
- [ ] All existing repository + plugin tests pass
- [ ] ESLint clean
- [ ] Changes committed to `plan/baileys-plugin/phase-2/task-02-repository`
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

No parallel tasks in Phase 2 — this is the only task.
