# Task: Baileys Plugin + Wiring

**Plan**: Baileys WhatsApp Plugin
**Phase**: 3
**Task ID (phase-local)**: task-03
**Task Path**: phase-3/task-03-plugin
**Depends On**: phase-2/task-02-repository
**JIRA**: N/A

## Objective

Create `Baileys.js` messenger plugin extending `MessengersBase`, register it in `factory.js`, and inject `whatsappSessionRepository` into the plugin via `dependencies.js`.

## Context

All messenger plugins follow the same structure (see `Dialog.js`, 449 lines):
- Class extends `MessengersBase` from `Base.js`
- Constructor: `constructor(licensee, dependencies)` — pass both to `super()`
- Must implement all abstract methods from `Base.js`: `parseMessageStatus()`, `parseMessage()`, `parseContactData()`, `contactWithDifferentData()`, `shouldUpdateWaStartChat()`, `sendMessage()`
- Optional: `getMediaUrl()`, `action()`
- `sendMessage()` sends a message object (looked up by ID from messageRepository) to WhatsApp via Baileys

Key Baileys concepts:
- Auth state = `{ creds, keys }` — load from `WhatsappSession`, save back on `creds.update` event
- `makeWASocket(config)` creates the socket — use `useMultiFileAuthState` pattern but adapted to DB storage
- Incoming messages arrive via `messages.upsert` event on the socket
- For personal use (initial scope): implement text message sending only; media can be a follow-up

**IMPORTANT**: Before installing `@whiskeysockets/baileys`, confirm with the user. The package is ESM-only — verify Jest/CommonJS compatibility (see mistake-log 2026-04-21: ESM-only packages broke Jest). Check if `package.json` has `"type": "module"` or if Jest is configured to transform this package.

Reference files:
- `src/app/plugins/messengers/Base.js` — abstract interface
- `src/app/plugins/messengers/Dialog.js` — full reference implementation
- `src/app/plugins/messengers/factory.js` — add case
- `src/app/runtime/dependencies.js` — add repo injection

## Before You Start

- [ ] Verify `phase-2/task-02-repository` status is `complete`
- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Create task branch: `git switch -c plan/baileys-plugin/phase-3/task-03-plugin`
- [ ] **Confirm with user before running**: `yarn add @whiskeysockets/baileys`
- [ ] After install, verify ESM compatibility: check `node_modules/@whiskeysockets/baileys/package.json` for `"type": "module"` and check `jest.config.js` for `transformIgnorePatterns`
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/plugins/messengers/Baileys.js` | create | Main plugin implementation |
| `src/app/plugins/messengers/factory.js` | modify | Add `case 'baileys'` |
| `src/app/runtime/dependencies.js` | modify | Inject whatsappSessionRepository |
| `package.json` | modify | Add @whiskeysockets/baileys dependency |
| `yarn.lock` | modify | Updated by yarn |

### Do NOT Modify

- `src/app/models/WhatsappSession.js` — owned by phase-1/task-01-data-model
- `src/app/repositories/whatsappsession.js` — owned by phase-2/task-02-repository
- `src/app/repositories/testing.js` — owned by phase-2/task-02-repository
- `src/app/plugins/messengers/Baileys.spec.js` — owned by phase-4/task-04-tests

## Implementation Steps

### Step 1: Install Baileys (after user approval)

```bash
yarn add @whiskeysockets/baileys
```

Check Jest transform config. If Baileys is ESM-only and Jest uses CommonJS transforms, add to `jest.config.js` `transformIgnorePatterns` exception or use a dynamic import workaround.

### Step 2: Create Baileys.js

Scaffold the class following Dialog.js structure:

```js
import { MessengersBase } from './Base.js'

class Baileys extends MessengersBase {
  constructor(licensee, dependencies = {}) {
    super(licensee, dependencies)
    this.whatsappSessionRepository = dependencies.whatsappSessionRepository
  }

  // Session management
  async loadOrCreateSession() {
    let session = await this.whatsappSessionRepository.findFirst({ licensee: this.licensee._id })
    if (!session) {
      session = await this.whatsappSessionRepository.create({ licensee: this.licensee._id })
    }
    return session
  }

  async saveSession(session, creds, keys) {
    await this.whatsappSessionRepository.update(session._id, { creds, keys })
  }

  // Required abstract method implementations
  parseMessageStatus(body) { /* parse delivery/read receipts */ }
  parseMessage(message) { /* parse incoming Baileys message to internal format */ }
  parseContactData(body) { /* extract contact name, phone from Baileys event */ }
  contactWithDifferentData(contact, parsedData) { /* detect name/waId changes */ }
  shouldUpdateWaStartChat(contact) { /* return true if wa_start_chat is null */ }
  async sendMessage(messageId) { /* load message, send via Baileys socket */ }
}

export { Baileys }
```

Implement each method based on Baileys event/message shape. For `sendMessage`, focus on text kind first; stub other kinds with a logged warning.

### Step 3: Update factory.js

```js
import { Baileys } from './Baileys.js'

// In switch:
case 'baileys':
  return new Baileys(licensee, dependencies)
```

### Step 4: Update dependencies.js

**a) Add import:**
```js
import { WhatsappSessionRepositoryDatabase } from '../repositories/whatsappsession.js'
```

**b) Add `whatsappSessionRepository` to `buildRuntimeDependencies` parameters:**
```js
function buildRuntimeDependencies({
  // ...existing params...
  whatsappSessionRepository,
} = {}) {
```

**c) Pass it to `createMessengerPlugin`:**
```js
const createMessengerPlugin = (licensee) =>
  createMessengerPluginFactory(licensee, {
    // ...existing deps...
    whatsappSessionRepository,
  })
```

**d) Add to `createRuntimeDependencies`:**
```js
whatsappSessionRepository: overrides.whatsappSessionRepository ?? new WhatsappSessionRepositoryDatabase(),
```

**e) Add to the returned object from `buildRuntimeDependencies`:**
```js
return {
  // ...existing...
  whatsappSessionRepository,
}
```

## Testing

- [ ] Run `npx jest src/app/plugins/messengers/Dialog.spec.js` — must still pass (factory/deps not broken)
- [ ] Run `npx jest` — all existing tests pass
- [ ] `npx eslint src/app/plugins/messengers/Baileys.js` passes clean
- [ ] Manual: instantiate `Baileys` plugin from factory with a baileys licensee — no crash

## Documentation / KB Updates

- [ ] If ESM compatibility required a non-obvious workaround, run `document-solution` to capture it in the KB

## Completion Criteria

- [ ] `Baileys.js` created, all abstract methods implemented
- [ ] `factory.js` routes `'baileys'` to new plugin
- [ ] `dependencies.js` injects `whatsappSessionRepository`
- [ ] `@whiskeysockets/baileys` in `package.json` (after user approval)
- [ ] All existing tests pass
- [ ] ESLint clean
- [ ] Changes committed to `plan/baileys-plugin/phase-3/task-03-plugin`
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

No parallel tasks in Phase 3 — this is the only task.
