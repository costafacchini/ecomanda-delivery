# Plan: Licensee Form Wizard

**Status**: not-started
**Created**: 2026-05-06
**Last Updated**: 2026-05-06
**Estimated Demo Date**: —
**Assigned Dev**: Alan Costa Facchini
**Assigned QA**: unassigned
**Master Plan**: None

## Objective

Split the large licensee form (~960 lines) into contextual tab panels that show or hide based on the user's chosen messenger and chatbot type, replacing the current single long form with scattered `display:none` visibility logic.

## Scope

### In Scope
- Extract field groups from `Form/index.js` into dedicated panel components (pure presentational)
- Bootstrap 5 Nav Tab shell in `Form/index.js` with `activeTab` state controlling which tab is active
- Tab visibility driven by form values (`whatsappDefault`, `chatbotDefault`) — tabs shown/hidden via CSS, panels always mounted so Formik captures all values on submit
- Update existing Vitest tests to account for the new component structure

### Out of Scope
- Multi-step wizard with Next/Back navigation (tabs are sufficient; wizard UX is a follow-up if requested)
- Server-side validation changes — no backend changes
- New form fields — layout refactor only
- Accessibility audit — out of scope for this iteration

## Kill Criteria
- If Formik is replaced with another form library before this plan executes

## Phases

| Phase | Name | Tasks | Dependencies | Description |
|-------|------|-------|--------------|-------------|
| 1 | Extract Panels | task-01, task-02, task-03 | None | Extract field groups into panel components; no behavior change |
| 2 | Tab Shell | task-04 | Phase 1 | Add Bootstrap Nav Tabs to Form/index.js, wiring panels |
| 3 | Tests | task-05 | Phase 2 | Update Vitest tests for new structure |

## Task Summary

| Task Path | Title | Phase | Status | Depends On |
|-----------|-------|-------|--------|------------|
| phase-1/task-01-panel-general | GeneralPanel + ChatbotPanel | 1 | not-started | — |
| phase-1/task-02-panel-comms | ChatPanel + WhatsAppPanel | 1 | not-started | — |
| phase-1/task-03-panel-infra | AwsPanel + CartPanel + FinancialPanel + OthersPanel | 1 | not-started | — |
| phase-2/task-04-tab-shell | Tab Shell in Form/index.js | 2 | not-started | phase-1/* |
| phase-3/task-05-tests | Vitest — update licensee form tests | 3 | not-started | phase-2/task-04-tab-shell |

## Branch Convention

Pattern: `plan/licensee-form-wizard/{task-path}`

Example branches:
- `plan/licensee-form-wizard/phase-1/task-01-panel-general`
- `plan/licensee-form-wizard/phase-2/task-04-tab-shell`

Base branch: `main`

## Key Files

| File/Directory | Relevance |
|----------------|-----------|
| `client/src/pages/Licensees/scenes/Form/index.js` | Source of all field groups; owns all panel extraction |
| `client/src/pages/Licensees/scenes/Form/panels/` | NEW directory — one file per panel component |
| `client/src/pages/Licensees/scenes/Edit/index.js` | Hosts `<Form>`; no changes needed |
| `client/src/services/licensee.js` | getBaileysQr service; consumed by WhatsAppPanel |
| `client/package.json` | Bootstrap 5.3 already available — no new deps |

## Risks

- Panel components receive large props surface (all Formik props + helpers); keep props explicit, do not spread `...props` blindly
- Always-mounted panels: all tabs must render even when not active — avoid conditional rendering with `&&`; use CSS `d-none` or tab `show/active` classes instead
- Formik `setFieldValue` must be threaded into panels that need it (e.g. WhatsAppPanel for QR state)

## Success Criteria

- [ ] All field groups extracted into panel components under `client/src/pages/Licensees/scenes/Form/panels/`
- [ ] Form/index.js renders Bootstrap Nav Tabs; active tab controlled by `activeTab` useState
- [ ] Correct tabs are visible/active based on `whatsappDefault` and `chatbotDefault` values
- [ ] All panes always mounted — submit captures all field values regardless of active tab
- [ ] QR code generation still works correctly when Baileys is selected
- [ ] Existing Vitest tests pass with updated selectors
- [ ] `npx eslint .` passes clean
- [ ] No regressions in create/edit licensee flow

## Defects

None

## References

- **Related Plans**: `baileys-plugin` (complete) — WhatsApp panel includes QR generation from that work
