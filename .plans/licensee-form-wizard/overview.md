# Plan: Licensee Form Wizard

**Status**: not-started
**Created**: 2026-05-06
**Last Updated**: 2026-05-07
**Estimated Demo Date**: —
**Assigned Dev**: Alan Costa Facchini
**Assigned QA**: unassigned
**Master Plan**: None

## Objective

Split the large licensee form (~960 lines) into contextual tab panels. The main tab collects identity data and 6 yes/no questions ("Integração com X?"). Each question, when checked, reveals a dedicated tab with the relevant configuration fields.

## Scope

### In Scope
- Extract field groups from `Form/index.js` into panel components under `panels/`
- **Main tab**: identity fields, read-only tokens/webhook URLs, 6 integration questions
- **Chat tab** (Q1): chatDefault combo + chat fields; visible when Q1 = true
- **ChatBot tab** (Q2): chatbotDefault combo + chatbot fields; visible when Q2 (`useChatbot`) = true
- **WhatsApp tab** (Q3): whatsappDefault combo + WA fields; visible when Q3 = true
- **Carrinho de Compras tab** (Q4): cartDefault combo + cart fields; visible when Q4 = true
- **PagarMe tab** (Q5): financial/bank fields + Pagar.Me button; visible when Q5 = true
- **Pedidos10 tab** (Q6): integrator/data fields + webhook button; visible only when `currentUser.isPedidos10` = true
- Q1/Q3/Q4/Q5 are local React state in `Form/index.js`, initialized from existing field values; no new model fields
- Q2 uses the existing `useChatbot` model field
- Q6 is controlled by `currentUser.isPedidos10` — no extra checkbox in main tab
- Bootstrap 5 Nav Tabs with always-mounted panes (CSS-driven visibility)
- Update existing tests

### Out of Scope
- AWS fields (`awsId`, `awsSecret`, `bucketName`) — not listed in wizard spec; keep in main tab as-is pending removal by remove-pdv plan
- New backend model fields — UI state only
- Multi-step wizard with Next/Back navigation
- Accessibility audit

## Kill Criteria
- If Formik is replaced with another form library before this plan executes

## Tab Layout

| Tab | Visible When | Key Fields |
|-----|-------------|------------|
| Principal | Always | name, active, kind, document, email, licenseKind, phone, apiToken (RO), 4 webhook URLs (RO), 6 questions |
| Chat | Q1 = true | chatDefault, chatUrl, useSenderName, chatIdentifier*, chatKey* |
| ChatBot | Q2 = true (`useChatbot`) | chatbotDefault, chatbotUrl, chatbotAuthorizationToken, chatbotApiToken, messageOnResetChatbot, messageOnCloseChat |
| WhatsApp | Q3 = true | whatsappDefault, whatsappToken†, whatsappUrl†, useFileIDYcloud‡, buttons |
| Carrinho | Q4 = true | cartDefault, useCartGallabox, unidadeId, statusId, productFractionals |
| PagarMe | Q5 = true | taxa, holder fields, bank fields, Integrar button |
| Pedidos10 | `currentUser.isPedidos10` | pedidos10_integrator, pedidos10_integration, Assinar webhook button |

\* Only when `chatDefault` is `crisp` or `chatwoot`
† Hidden when `whatsappDefault === 'baileys'`
‡ Only when `whatsappDefault === 'ycloud'`

## Question State Strategy

| Question | State | Initialization | Reset on false |
|----------|-------|----------------|----------------|
| Q1 useChat | local useState | `initialValues.chatDefault !== ''` | setFieldValue('chatDefault', '') |
| Q2 useChatbot | Formik field (existing) | from initialValues | setFieldValue('useChatbot', false) |
| Q3 useWhatsapp | local useState | `initialValues.whatsappDefault !== ''` | setFieldValue('whatsappDefault', '') |
| Q4 useCart | local useState | `initialValues.cartDefault !== ''` | setFieldValue('cartDefault', '') |
| Q5 usePagarMe | local useState | `initialValues.holder_name !== '' \|\| initialValues.financial_player_fee !== '0.00'` | no reset (financial data preserved) |
| Q6 | `currentUser.isPedidos10` | N/A | N/A — not a checkbox |

## Phases

| Phase | Name | Tasks | Dependencies | Description |
|-------|------|-------|--------------|-------------|
| 1 | Extract Panels | task-01, task-02, task-03 | None | Extract field groups into panel components; no behavior change |
| 2 | Tab Shell | task-04 | Phase 1 | Add Bootstrap Nav Tabs, questions, tab visibility logic |
| 3 | Tests | task-05 | Phase 2 | Update existing tests for new structure |

## Task Summary

| Task Path | Title | Phase | Status | Depends On |
|-----------|-------|-------|--------|------------|
| phase-1/task-01-panel-general | MainPanel | 1 | not-started | — |
| phase-1/task-02-panel-comms | ChatPanel + ChatbotPanel | 1 | not-started | — |
| phase-1/task-03-panel-infra | WhatsAppPanel + CartPanel + PagarMePanel + Pedidos10Panel | 1 | not-started | — |
| phase-2/task-04-tab-shell | Tab Shell in Form/index.js | 2 | not-started | phase-1/* |
| phase-3/task-05-tests | Update Licensee Form Tests | 3 | not-started | phase-2/task-04-tab-shell |

## Branch Convention

Pattern: `plan/licensee-form-wizard/{task-path}`

Example branches:
- `plan/licensee-form-wizard/phase-1/task-01-panel-general`
- `plan/licensee-form-wizard/phase-2/task-04-tab-shell`

Base branch: `main`

## Key Files

| File/Directory | Relevance |
|----------------|-----------|
| `client/src/pages/Licensees/scenes/Form/index.js` | Source — ~960 lines; all panels extracted from here |
| `client/src/pages/Licensees/scenes/Form/panels/` | NEW directory — one file per panel |
| `client/src/services/licensee.js` | Service calls used by WhatsAppPanel and others |
| `client/package.json` | Bootstrap 5.3 and qrcode.react already available |

## Risks

- Q1/Q3/Q4 local state initialised from field values: editing an existing licensee that has chatDefault set will correctly show Chat tab; a new licensee starts with all questions unchecked
- Always-mounted panes: do NOT use `&&` for panels — use CSS `show active` classes or `d-none` on panes
- Tab nav buttons must have `type="button"` to prevent form submission

## Success Criteria

- [ ] All panel components created under `panels/`
- [ ] Main tab shows identity fields + 6 questions; all questions work as checkboxes
- [ ] Each integration tab appears/disappears based on its question
- [ ] All panes always mounted — submit captures all field values
- [ ] Existing conditional logic inside tabs preserved (e.g. chatIdentifier only for crisp/chatwoot)
- [ ] Baileys QR generation still works on WhatsApp tab
- [ ] All existing tests pass; new tab-switch tests added
- [ ] `npx eslint .` passes

## Defects

None

## References

- **Related Plans**: `baileys-plugin` (complete) — QR code generation in WhatsApp tab
- **Related Plans**: `remove-pdv` (not-started) — may remove Cart/PagarMe tabs; run before or after
