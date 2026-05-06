# Task: Defect — JID Suffix Not Stripped Before NormalizePhone

**Plan**: Baileys WhatsApp Plugin
**Task ID**: task-07
**Task Path**: phase-3/task-07-defect-jid-normalize
**Depends On**: None
**Blocks**: None
**JIRA**: N/A
**Severity**: P1
**Found By**: Code review
**Found During**: phase-3/task-03-plugin (Baileys.js parseContactData)

## Bug Description

Incoming WhatsApp messages carry a JID (Jabber ID) as the sender address, e.g. `5511990283745@s.whatsapp.net`. `parseContactData` passes this raw JID directly to `NormalizePhone` at line 59.

`NormalizePhone` strips all characters except `[0-9.-]`, so `@s.whatsapp.net` becomes `..` (two dots — one per dot in `.whatsapp.net`). The `normalize()` helper only removes the final trailing dot, leaving the stored number as `5511990283745.` (with one trailing dot).

**Effect**: `contactRepository.findFirst({ number: '5511990283745.' })` never matches an existing contact stored as `5511990283745`, so every incoming message creates a duplicate contact instead of reusing the existing one.

**Repro**:
```js
new NormalizePhone('5511990283745@s.whatsapp.net').number
// → '5511990283745.'   ← trailing dot
```

**Expected**:
```js
new NormalizePhone('5511990283745').number
// → '5511990283745'   ← clean
```

## Root Cause

**File**: `src/app/plugins/messengers/Baileys.js` lines 58–59

```js
const remoteJid = body.key.remoteJid          // '5511990283745@s.whatsapp.net'
const normalizePhone = new NormalizePhone(remoteJid)  // ← passes raw JID
```

Line 64 already strips the suffix correctly for `waId`:
```js
waId: remoteJid.replace(/@s\.whatsapp\.net$/, '').replace(/@g\.us$/, ''),
```

The same stripping must be applied before `NormalizePhone`.

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/plugins/messengers/Baileys.js` | modify | Strip JID suffix before NormalizePhone (line 58-59) |
| `src/app/plugins/messengers/Baileys.spec.js` | modify | Add regression test asserting number has no trailing dot |

### Do NOT Modify

- Any model, repository, or route file — not involved

## Implementation Steps

### Step 1: Fix parseContactData in Baileys.js

Replace lines 58–59:

```js
// Before
const remoteJid = body.key.remoteJid
const normalizePhone = new NormalizePhone(remoteJid)
```

```js
// After
const remoteJid = body.key.remoteJid
const phone = remoteJid.replace(/@s\.whatsapp\.net$/, '').replace(/@g\.us$/, '')
const normalizePhone = new NormalizePhone(phone)
```

### Step 2: Add regression test in Baileys.spec.js

In the `#responseToMessages > contact management` describe block, add a test that asserts the stored contact number does NOT contain a trailing dot:

```js
it('stores contact number without trailing dot from JID suffix', async () => {
  // arrange: message with full JID
  const body = { key: { remoteJid: '5511990283745@s.whatsapp.net', fromMe: false, id: 'abc' }, message: { conversation: 'hi' }, pushName: 'Test' }
  const plugin = new Baileys(licensee, dependencies)

  await plugin.responseToMessages(body)

  const contact = await repositories.contactRepository.findFirst({ licensee: licensee._id })
  expect(contact.number).not.toMatch(/\.$/)
})
```

## Testing

- [ ] Regression test fails before the fix, passes after
- [ ] All existing Baileys.spec.js tests still pass
- [ ] `npx jest src/app/plugins/messengers/Baileys.spec.js` — all pass
- [ ] `npx eslint src/app/plugins/messengers/Baileys.js` — clean

## Completion Criteria

- [ ] `parseContactData` strips JID suffix before calling `NormalizePhone`
- [ ] Regression test added and passing
- [ ] All existing tests pass
- [ ] Changes committed to `plan/baileys-plugin/phase-3/task-07-defect-jid-normalize`
- [ ] Status updated in `status.md`
