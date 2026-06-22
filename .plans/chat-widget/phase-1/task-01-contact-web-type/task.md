# Task: Contact — web type + widgetSessionToken

**Plan**: Chat Widget
**Phase**: 1
**Task ID (phase-local)**: task-01
**Task Path**: phase-1/task-01-contact-web-type
**Depends On**: None
**JIRA**: N/A

## Objective

Add `web` as a valid Contact type and introduce a `widgetSessionToken` field. Patch both the Mongoose pre-save hook and the in-memory repository's normalization helper so that web contacts bypass `NormalizePhone` entirely — their `number` is a raw phone string (or `'00000000000'` when the visitor didn't provide one) and must not be reformatted.

## Context

`Contact.type` is currently set implicitly by `NormalizePhone` in two places:

1. **`src/app/models/Contact.ts` pre-save hook** — runs `NormalizePhone` when `number.includes('@') || !type`.
2. **`src/app/repositories/contact.ts` `ContactRepositoryMemory.normalizeContactFields`** — same condition.

Widget visitors provide name + email (required) and optionally a phone. The contact is stored as:
- `number` = visitor phone if provided, else `'00000000000'` (placeholder that satisfies the required field without triggering a real WhatsApp lookup)
- `email` = visitor email (field already exists in the schema)
- `type` = `'web'`

Since `type: 'web'` is always set explicitly before saving, the existing condition `number.includes('@') || !type` already evaluates to `false` — NormalizePhone never runs for web contacts. No additional bypass guards are needed in the pre-save hook or the memory repository.

The `widgetSessionToken` is a UUID stored on the Contact and returned to the widget's localStorage. It acts as the session identifier for all subsequent widget API calls.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Check `status.md` — must be `not-started` before proceeding
- [ ] Read `docs/kb/architecture/project-overview.md` — folder layout and plugin overview
- [ ] Mark this task `in-progress` in `status.md` before writing code

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/models/Contact.ts` | modify | Add `widgetSessionToken` field |
| `src/app/models/Contact.spec.ts` | modify | Add specs for web type and widgetSessionToken |

### Do NOT Modify

- `src/app/repositories/contact.ts` — no bypass guard needed; existing condition already handles `type === 'web'`
- `src/app/repositories/message.ts` — owned by phase-1/task-02-message-findbyroom
- `src/app/helpers/NormalizePhone.ts` — no changes needed

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

### Step 2: Add specs

In `src/app/models/Contact.spec.ts`, add a describe block covering:
- A web contact created with `{ number: '11999990000', type: 'web', talkingWithChatBot: false, licensee }` saves with number unchanged (no normalization)
- A web contact created with `{ number: '00000000000', type: 'web', ... }` saves without error
- `widgetSessionToken` can be set and retrieved
- A regular phone contact still normalizes correctly (regression guard)

## Testing

- [ ] New specs pass: web contact saves with `number` unchanged, `type` remains `'web'`
- [ ] `widgetSessionToken` field persists on save
- [ ] Existing Contact specs still pass (no regression on phone normalization)
- [ ] `yarn test src/app/models/Contact.spec.ts` green
- [ ] `yarn typecheck` passes

## Documentation / KB Updates

No KB/doc updates required — this is a model field addition; the pattern is straightforward.

## Completion Criteria

- [ ] `web` type saves without NormalizePhone clobbering the number
- [ ] `widgetSessionToken` field present in schema
- [ ] New specs pass; existing tests unaffected
- [ ] Status updated to `complete` in `status.md`

## Conflict Avoidance Notes

- task-02-message-findbyroom runs in parallel — no shared files.
