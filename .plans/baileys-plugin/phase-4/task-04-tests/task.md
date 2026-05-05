# Task: Baileys Plugin Tests

**Plan**: Baileys WhatsApp Plugin
**Phase**: 4
**Task ID (phase-local)**: task-04
**Task Path**: phase-4/task-04-tests
**Depends On**: phase-3/task-03-plugin
**JIRA**: N/A

## Objective

Write `Baileys.spec.js` covering incoming message parsing, outgoing message sending, and session persistence — following `Dialog.spec.js` patterns exactly.

## Context

All messenger plugin tests follow this structure (see `Dialog.spec.js`, 2,875 lines):

**Setup pattern:**
```js
beforeEach(async () => {
  installMemoryRepositories()
  dependencies = createRuntimeDependencies()
  jest.clearAllMocks()
  licensee = await licenseeRepository.create({ whatsappDefault: 'baileys', ... })
})
```

**Key mocks used in Dialog.spec.js:**
- `jest.mock('../../services/request.js')` — mock HTTP
- `jest.spyOn(S3.prototype, 'uploadFile')` — mock S3
- `jest.spyOn(console, 'info')` / `console.error`

For Baileys, instead of HTTP mocks we mock the Baileys socket:
- Mock `makeWASocket` or the socket's `sendMessage` method
- Mock session repository methods via the memory repo (already wired in testing.js)

**Test categories to cover (following Dialog.spec.js layout):**

1. `responseToMessages` — incoming messages:
   - Text message creates message record with correct fields
   - Contact is created if not found
   - Contact is updated if name changed
   - Unknown/unsupported message types are ignored (return null)

2. `sendMessage` — outgoing:
   - Text message is sent via Baileys socket
   - On success: marks `sended: true`, saves `messageWaId`
   - On failure: logs error, saves error to message

3. `loadOrCreateSession`:
   - Creates new session if none exists for licensee
   - Returns existing session if found

4. `saveSession`:
   - Updates creds and keys on existing session

**Test factories:** Use the same licensee/contact factory builders used in Dialog.spec.js. Check `src/app/factories/` or wherever factories live.

## Before You Start

- [ ] Verify `phase-3/task-03-plugin` status is `complete`
- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Create task branch: `git switch -c plan/baileys-plugin/phase-4/task-04-tests`
- [ ] Read `Dialog.spec.js` (lines 1-60) to confirm current setup/teardown pattern
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/plugins/messengers/Baileys.spec.js` | create | Full test suite |

### Do NOT Modify

- `src/app/plugins/messengers/Baileys.js` — owned by phase-3/task-03-plugin (read only)
- `src/app/repositories/testing.js` — owned by phase-2/task-02-repository
- Any model or repository file — owned by earlier phases

## Implementation Steps

### Step 1: Scaffold the spec file

Start with the standard imports and setup block from Dialog.spec.js:

```js
import { installMemoryRepositories } from '../../repositories/testing.js'
import { createRuntimeDependencies } from '../../runtime/dependencies.js'
// ...other imports matching Dialog.spec.js top section

describe('Baileys plugin', () => {
  let licensee
  let dependencies
  let licenseeRepository

  beforeEach(async () => {
    const { repositories } = installMemoryRepositories()
    licenseeRepository = repositories.licenseeRepository
    dependencies = createRuntimeDependencies()
    jest.clearAllMocks()
    licensee = await licenseeRepository.create({
      name: 'Alcatraz',
      phone: '99999999999',
      active: true,
      whatsappDefault: 'baileys',
      licenseKind: 'demo',
    })
  })
  // ...
})
```

### Step 2: Implement responseToMessages tests

Write at minimum:
- 1 test: text message → creates message with `kind: 'text'`, correct licensee/contact
- 1 test: sticker/unknown type → returns empty array (no message created)
- 1 test: new contact created on first message
- 1 test: contact name updated if different

### Step 3: Implement sendMessage tests

Write at minimum:
- 1 test: text message sent, `sended: true` set, `messageWaId` stored
- 1 test: Baileys socket throws → error saved to message, `sended` remains false

### Step 4: Implement session tests

Write at minimum:
- 1 test: `loadOrCreateSession` creates session when none exists
- 1 test: `loadOrCreateSession` returns existing session
- 1 test: `saveSession` persists updated creds and keys

### Step 5: Run and fix

```bash
npx jest src/app/plugins/messengers/Baileys.spec.js
```

Fix any failures before marking complete.

## Testing

- [ ] `npx jest src/app/plugins/messengers/Baileys.spec.js` — all tests pass
- [ ] `npx jest` — full suite passes (no regressions)
- [ ] `npx eslint src/app/plugins/messengers/Baileys.spec.js` passes clean

## Documentation / KB Updates

- [ ] If Baileys message event shapes required non-obvious parsing, run `document-solution` to capture the pattern

## Completion Criteria

- [ ] `Baileys.spec.js` covers: incoming text, unknown type handling, contact create/update, outgoing text, send failure, session load/create, session save
- [ ] All spec assertions verify behavior, not just code paths
- [ ] Full test suite passes with no regressions
- [ ] ESLint clean
- [ ] Changes committed to `plan/baileys-plugin/phase-4/task-04-tests`
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

No parallel tasks in Phase 4 — this is the only task.
