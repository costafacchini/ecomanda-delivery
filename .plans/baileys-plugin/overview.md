# Plan: Baileys WhatsApp Plugin

**Status**: not-started
**Created**: 2026-05-05
**Last Updated**: 2026-05-05
**Estimated Demo Date**: —
**Assigned Dev**: Alan Costa Facchini
**Assigned QA**: unassigned
**Master Plan**: None

## Objective

Add a Baileys-based WhatsApp messenger plugin that follows the same architecture as the Dialog plugin — extends `MessengersBase`, registers in the plugin factory, and stores session credentials in a dedicated `WhatsappSession` model.

## Scope

### In Scope
- `WhatsappSession` Mongoose model (creds + keys per licensee)
- `WhatsappSessionRepository` (Database + Memory variants)
- `Baileys.js` plugin extending `MessengersBase`
- Registration in `factory.js` and wiring in `dependencies.js`
- Licensee schema: add `'baileys'` to `whatsappDefault` enum; relax `whatsappToken`/`whatsappUrl` required validators for `baileys`
- Tests for the Baileys plugin following Dialog.spec.js patterns
- `POST /resources/licensees/:id/baileys-qr` endpoint returning QR string
- Admin form: `'baileys'` option in dropdown, QR button + display, hide token/URL fields

### Out of Scope
- WhatsApp template / media support beyond basic text — initial scope is text messages only
- Multi-device session management — single session per licensee only
- Session disconnect/logout endpoint — not requested (follow-up if needed)

## Kill Criteria
- If `@whiskeysockets/baileys` becomes abandoned or incompatible with the Node.js version in use
- If WhatsApp blocks the Baileys-based connection method entirely

## Phases

| Phase | Name | Tasks | Dependencies | Description |
|-------|------|-------|--------------|-------------|
| 1 | Data Model | task-01 | None | Create WhatsappSession model, update Licensee schema |
| 2 | Repository | task-02 | Phase 1 | Create WhatsappSessionRepository, wire into testing + index |
| 3 | Plugin & Wiring | task-03 | Phase 2 | Create Baileys.js plugin, register in factory, inject into dependencies |
| 4 | Tests | task-04 | Phase 3 | Baileys.spec.js following Dialog.spec.js patterns |
| 5 | QR Endpoint | task-05 | Phase 3 | POST /resources/licensees/:id/baileys-qr — returns QR string |
| 6 | Admin Form | task-06 | Phase 5 | Licensee form: baileys option, QR button, hide token/URL fields |

## Task Summary

| Task Path | Title | Phase | Status | Depends On |
|-----------|-------|-------|--------|------------|
| phase-1/task-01-data-model | WhatsappSession Model + Licensee Schema | 1 | not-started | — |
| phase-2/task-02-repository | WhatsappSession Repository | 2 | not-started | phase-1/task-01-data-model |
| phase-3/task-03-plugin | Baileys Plugin + Wiring | 3 | not-started | phase-2/task-02-repository |
| phase-4/task-04-tests | Baileys Plugin Tests | 4 | not-started | phase-3/task-03-plugin |
| phase-5/task-05-qr-endpoint | Baileys QR Code Endpoint | 5 | not-started | phase-3/task-03-plugin |
| phase-6/task-06-admin-form | Admin Form — Baileys QR Display | 6 | not-started | phase-5/task-05-qr-endpoint |

## Branch Convention

Pattern: `plan/baileys-plugin/{task-path}`

Example branches:
- `plan/baileys-plugin/phase-1/task-01-data-model`
- `plan/baileys-plugin/phase-3/task-03-plugin`

Base branch: `main`

## Key Files

| File/Directory | Relevance |
|----------------|-----------|
| `src/app/plugins/messengers/Base.js` | Abstract base class — all abstract methods must be implemented |
| `src/app/plugins/messengers/Dialog.js` | Reference implementation — follow its structure exactly |
| `src/app/plugins/messengers/factory.js` | Add `case 'baileys'` |
| `src/app/models/Licensee.js` | Add `'baileys'` enum value, relax token/URL validators |
| `src/app/repositories/contact.js` | Repository pattern to follow for WhatsappSessionRepository |
| `src/app/repositories/testing.js` | Add whatsappSessions state + wiring to installMemoryRepositories() |
| `src/app/runtime/dependencies.js` | Inject whatsappSessionRepository into messenger plugin factory |

## Risks

- `@whiskeysockets/baileys` is ESM-only — repo uses CommonJS Jest transforms; verify compatibility before adopting (see mistake-log 2026-04-21)
- WhatsApp may ban numbers using non-official clients — acceptable for personal use scope
- Baileys session auth state schema may change between library versions — store as `Mixed` (schemaless) to absorb changes without migrations

## Success Criteria

- [ ] `WhatsappSession` model and repository follow existing patterns exactly
- [ ] `Licensee` with `whatsappDefault: 'baileys'` passes validation without requiring `whatsappToken`/`whatsappUrl`
- [ ] `factory.js` instantiates `Baileys` plugin for `whatsappDefault === 'baileys'`
- [ ] `Baileys.js` implements all abstract methods from `MessengersBase`
- [ ] `Baileys.spec.js` covers incoming messages, outgoing messages, and session persistence
- [ ] `POST /resources/licensees/:id/baileys-qr` returns `{ qr }` string or `{ message: 'Já conectado' }`
- [ ] Admin form shows "Gerar QR Code" button and renders QR image when `baileys` is selected
- [ ] Admin form hides token/URL fields when `baileys` is selected
- [ ] All existing tests pass (no regressions)
- [ ] `npx eslint .` passes clean

## References

- **JIRA Epic**: N/A
- **Weekly Plan Brief**: N/A
- **Related Plans**: None
- **Rock Alignment**: N/A
