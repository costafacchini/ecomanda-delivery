# Plan: Licensee Create Wizard + Edit Simplification

**Status**: not-started
**Created**: 2026-05-07
**Last Updated**: 2026-05-07
**Estimated Demo Date**: —
**Assigned Dev**: Alan Costa Facchini
**Assigned QA**: unassigned
**Master Plan**: None

## Objective

Replace the current New Licensee page (which reuses the full Edit form) with a guided
multi-step wizard that collects integration settings step-by-step via Yes/No gates. Each
step validates required fields before advancing. The Edit form is simplified in parallel by
removing the 6 question checkboxes from MainPanel (their job is done by the wizard for
create; for edit, tab visibility is already driven by initialValues).

## Scope

### In Scope

- New full-page multi-step wizard (`LicenseeWizard.js`) replacing the generic Form on the New route
- 7 steps: Identity, Chat, ChatBot, WhatsApp, Carrinho, PagarMe, Pedidos10
- Yes/No gate UI on steps 2-7; field revelation on Yes; per-step Yup validation
- Pedidos10 step conditional on `currentUser.isPedidos10`
- Reuse of existing panel components (`ChatPanel`, `ChatbotPanel`, etc.) inside wizard steps
- Wire final Save to `createLicensee` → toast + navigate('/licensees')
- Remove 6 question checkboxes from `MainPanel.js`; remove unused state props from `Form/index.js`
- Update all affected tests; add wizard flow tests

### Out of Scope

- Modal variant (full-page chosen)
- Backend model changes
- Edit flow wizard (edit keeps tab form)
- Accessibility audit
- Animation/transition effects beyond Bootstrap fade

## Kill Criteria

- If Formik is replaced with another form library before this plan executes

## Phases

| Phase | Name | Tasks | Dependencies | Description |
|-------|------|-------|--------------|-------------|
| 1 | Edit Simplify | task-01 | None | Remove 6 question checkboxes from MainPanel + cleanup Form/index.js props |
| 2 | Wizard Shell | task-02 | Phase 1 | Wizard shell: step management, nav buttons, progress indicator |
| 3 | Step Content | task-03, task-04 | Phase 2 | Step 1 identity fields; Steps 2-7 Yes/No gates (task-04 chains from task-03) |
| 4 | Submit + Tests | task-05 | Phase 3 | Payload cleanup, backend errors, full test coverage |

## Task Summary

| Task Path | Title | Phase | Status | Depends On |
|-----------|-------|-------|--------|------------|
| phase-1/task-01-edit-simplify | Edit Simplification | 1 | not-started | — |
| phase-2/task-02-wizard-shell | Wizard Shell | 2 | not-started | phase-1/task-01-edit-simplify |
| phase-3/task-03-step-identity | Step 1: Identity | 3 | not-started | phase-2/task-02-wizard-shell |
| phase-3/task-04-step-integrations | Steps 2-7: Integrations | 3 | not-started | phase-3/task-03-step-identity |
| phase-4/task-05-wizard-submit | Wizard Submit + Tests | 4 | not-started | phase-3/task-04-step-integrations |

## Branch Convention

Pattern: `plan/licensee-wizard/{task-path}`

Base branch: `plan/licensee-form-wizard/consolidated`

Example branches:
- `plan/licensee-wizard/phase-1/task-01-edit-simplify`
- `plan/licensee-wizard/phase-2/task-02-wizard-shell`
- `plan/licensee-wizard/phase-3/task-03-step-identity`
- `plan/licensee-wizard/phase-3/task-04-step-integrations`
- `plan/licensee-wizard/phase-4/task-05-wizard-submit`

## Key Files

| File | Relevance |
|------|-----------|
| `client/src/pages/Licensees/scenes/New/index.js` | Updated to render LicenseeWizard instead of Form |
| `client/src/pages/Licensees/scenes/New/LicenseeWizard.js` | NEW — wizard shell + all steps |
| `client/src/pages/Licensees/scenes/Form/panels/MainPanel.js` | Simplified — 6 question checkboxes removed |
| `client/src/pages/Licensees/scenes/Form/index.js` | Remove question props passed to MainPanel |
| `client/src/pages/Licensees/scenes/New/index.spec.js` | Rewritten with wizard flow tests |
| `client/src/pages/Licensees/scenes/Form/index.spec.js` | Updated — remove question checkbox assertions |
| `client/src/services/licensee.js` | createLicensee(values) used by wizard Save |

## Risks

1. **task-03 and task-04 both modify `LicenseeWizard.js`** — task-04 must branch from task-03, not task-02. Both tasks are sequentially chained within Phase 3.
2. **Panel reuse in wizard** — panels accept `(values, errors, touched, handleChange, handleBlur)` props. Wizard's Formik instance forwards those same props. No panel changes needed.
3. **Yes/No state is wizard-local** — must not leak to `createLicensee` payload. Strip wizard-only keys before calling service.
4. **`useChatbot` is a Formik field** — in wizard, initialised to `false`; ChatBot step Yes sets it to `true` via `setFieldValue`. Matches existing initialValues shape.
5. **PagarMe / Pedidos10 action buttons** — these panels include action buttons (Integrar, Assinar Webhook) that require an existing licensee ID. Skip rendering those buttons in wizard steps; they remain available on the Edit tab form.

## Success Criteria

- [ ] New Licensee page renders the multi-step wizard
- [ ] Each step validates required fields; Next shows errors until valid
- [ ] Yes/No steps gate field visibility and per-step validation
- [ ] Pedidos10 step only shown when `currentUser.isPedidos10`
- [ ] Cancel navigates to /licensees from any step
- [ ] Save calls `createLicensee` and on 201 → toast + navigate('/licensees')
- [ ] On error → backend errors displayed on last step
- [ ] Edit form MainPanel no longer has 6 question checkboxes
- [ ] All existing Form/index.spec.js tests pass (updated for removed checkboxes)
- [ ] New wizard tests cover happy path + error path + step validation + Yes/No
- [ ] `npx eslint .` passes

## Defects

None

## References

- **Chains from**: `plan/licensee-form-wizard/consolidated` (provides panel components + Form tabs)
- **Related plan**: `remove-pdv` — if Cart/PagarMe tabs are removed, wizard steps 5-6 would also go. Coordinate ordering.
- **Bootstrap 5.3** already present — no new dependencies required
