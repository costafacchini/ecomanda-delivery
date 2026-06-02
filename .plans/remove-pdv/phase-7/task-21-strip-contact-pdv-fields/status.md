# Status: Remove PDV fields from Contact schema

**Current Status**: in-progress
**Last Updated**: 2026-06-02
**Agent**: claude-sonnet-4-6
**Branch**: main
**PR**: —

## Status History

| Timestamp | Status | Agent | Notes |
|-----------|--------|-------|-------|
| 2026-04-28 | not-started | — | Task created |
| 2026-06-02 | in-progress | claude-sonnet-4-6 | Removing 8 PDV delivery/address fields from Contact schema |

## Blockers

None

## Artifacts

- Removed 8 PDV fields from `src/app/models/Contact.ts` schema: `address`, `address_number`, `address_complement`, `neighborhood`, `cep`, `delivery_tax`, `plugin_cart_id`, `address_id`
- Removed `cep` sanitization block from the `pre('save')` hook (field no longer exists)
- `src/app/models/Contact.spec.ts` — no PDV-field test cases were present; no changes needed
- `src/app/factories/contact.ts` — no PDV-field defaults were present; no changes needed
- All 8 tests pass (`npx jest src/app/models/Contact.spec.ts`)

### DB Migration Script

Run this against MongoDB **after** deploying this change to unset orphaned fields from existing documents:

```js
// MongoDB unset script — run after deploying this change
db.contacts.updateMany({}, { $unset: { address: '', address_number: '', address_complement: '', neighborhood: '', cep: '', delivery_tax: '', plugin_cart_id: '', address_id: '' } })
```

### Non-PDV Consumers Note

The grep scan revealed other files referencing these field names (e.g. `plugins/carts/`, `plugins/payments/PagarMe/`, `repositories/contact.ts`, `usecases/contacts/`). These are all PDV-related callers and will be addressed by their respective removal tasks in this plan.

## Adaptations

None
