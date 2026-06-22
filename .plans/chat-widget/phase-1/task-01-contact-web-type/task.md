# Task: Contact — web type + widgetSessionToken

**Plan**: Chat Widget
**Phase**: 1
**Task ID (phase-local)**: task-01
**Task Path**: phase-1/task-01-contact-web-type
**Depends On**: None
**JIRA**: N/A

## Objective

Add `web` as a valid Contact type and introduce a `widgetSessionToken` field. Patch both the Mongoose pre-save hook and the in-memory repository's normalization helper so that email-address numbers are not passed through `NormalizePhone` for web contacts.

## Context

`Contact.type` is currently set implicitly by `NormalizePhone` in two places:

1. **`src/app/models/Contact.ts` pre-save hook** — runs `NormalizePhone` when `number.includes('@') || !type`.
2. **`src/app/repositories/contact.ts` `ContactRepositoryMemory.normalizeContactFields`** — same condition.

Widget visitors are identified by email (their `number` will be an email string like `user@example.com`). Since email contains `@`, both guards currently trigger `NormalizePhone`, which would clobber the intended `type: 'web'`. Both places must short-circuit when `type === 'web'` is already set.

The `widgetSessionToken` is a UUID stored on the Contact and returned to the widget's localStorage. It acts as the session identifier for all subsequent widget API calls.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Check `status.md` — must be `not-started` before proceeding
- [ ] Read `docs/kb/architecture/project-overview.md` — folder layout and plugin overview
- [ ] Mark this task `in-progress` in `status.md` before writing code

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/models/Contact.ts` | modify | Add `widgetSessionToken` field; guard pre-save hook |
| `src/app/models/Contact.spec.ts` | modify | Add specs for web type and widgetSessionToken |
| `src/app/repositories/contact.ts` | modify | Guard `normalizeContactFields` for `type === 'web'` |

### Do NOT Modify

- `src/app/repositories/message.ts` — owned by phase-1/task-02-message-findbyroom
- `src/app/helpers/NormalizePhone.ts` — no changes needed; guards go in callers

## Implementation Steps

### Step 1: Add `widgetSessionToken` to contactSchema

In `src/app/models/Contact.ts`, add to `contactSchema`:

```ts
widgetSessionToken: {
  type: String,
  sparse: true,
},
```

`sparse: true` allows multiple documents to have `null`/undefined while still enforcing uniqueness among set values if you add `unique: true` (optional for MVP — add if desired).

### Step 2: Guard the pre-save hook

In the same file, update the pre-save hook to skip normalization for web contacts:

```ts
contactSchema.pre('save', function () {
  const contact = this

  if (!contact._id) {
    contact._id = new mongoose.Types.ObjectId()
  }

  // Web contacts use email as number — skip phone normalization
  if (contact.type === 'web') return

  if (contact.number.includes('@') || !contact.type) {
    const normalizedPhone = new NormalizePhone(contact.number)
    contact.number = normalizedPhone.number
    contact.type = normalizedPhone.type
  }
})
```

### Step 3: Guard ContactRepositoryMemory.normalizeContactFields

In `src/app/repositories/contact.ts`, update the normalization block:

```ts
// Web contacts use email as number — skip phone normalization
if (normalizedFields.type === 'web') return normalizedFields

if (normalizedFields.number?.includes('@') || !normalizedFields.type) {
  const normalizedPhone = new NormalizePhone(normalizedFields.number)
  normalizedFields.number = normalizedPhone.number
  normalizedFields.type = normalizedPhone.type
}
```

The guard must be placed immediately before the existing `if (normalizedFields.number?.includes('@')` block.

### Step 4: Add specs

In `src/app/models/Contact.spec.ts`, add a describe block covering:
- A web contact created with `{ number: 'user@example.com', type: 'web', talkingWithChatBot: false, licensee }` saves successfully without normalizing the number
- `widgetSessionToken` can be set and retrieved
- A phone-type contact still normalizes correctly (regression)

## Testing

- [ ] New specs pass: web contact saves with email as `number`, type remains `'web'`
- [ ] `widgetSessionToken` field persists on save
- [ ] Existing Contact specs still pass (no regression on phone normalization)
- [ ] `yarn test src/app/models/Contact.spec.ts` green
- [ ] `yarn typecheck` passes

## Documentation / KB Updates

No KB/doc updates required — this is a model field addition; the pattern is straightforward.

## Completion Criteria

- [ ] `web` type saves without NormalizePhone clobbering email number
- [ ] `widgetSessionToken` field present in schema
- [ ] Memory repo normalization guards in place
- [ ] New specs pass; existing tests unaffected
- [ ] Status updated to `complete` in `status.md`

## Conflict Avoidance Notes

- task-02-message-findbyroom runs in parallel — no shared files.
