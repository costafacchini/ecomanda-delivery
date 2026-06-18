---
timestamp: 2026-06-18T13-22-03Z
slug: client-src-pages-contacts
---
---
score: 20
p0: 0
p1: 3
p2: 4
p3: 3
target: client/src/pages/Contacts
---

# UX Critique — Contacts Page

**Surface**: `client/src/pages/Contacts` (Index, Form, Edit, New)
**Date**: 2026-06-18
**Score**: 20 / 40

---

## Nielsen Heuristics

| # | Heuristic | Score | Notes |
|---|-----------|-------|-------|
| 1 | Visibility of System Status | 2/4 | Edit has spinner; Index/New have no loading feedback during async fetch/save |
| 2 | Match Between System and Real World | 2/4 | Labels are readable; `ud` field present in form state but has no UI control — data silently inaccessible |
| 3 | User Control and Freedom | 2/4 | "Voltar" button works; no undo after save, no confirmation on navigate-away with unsaved changes |
| 4 | Consistency and Standards | 2/4 | Toggle button label changes to describe current *state* ("Apenas Grupos") not the *action* — violates label convention |
| 5 | Error Prevention | 1/4 | Validation schema is nearly empty (`name: Yup.string()` only); no required field indicators; no format hints for phone/email/CEP |
| 6 | Recognition Rather than Recall | 2/4 | Technical fields (`waId`, `landbotId`, `plugin_cart_id`, `ud`) lack any help text or placeholders explaining expected format |
| 7 | Flexibility and Efficiency | 2/4 | Search + licensee filter + group toggle cover basics; no pagination keyboard shortcut, no bulk select |
| 8 | Aesthetic and Minimalist Design | 2/4 | Functional and clean; `delivery_tax` and `plugin_cart_id` live in the address fieldset — poor semantic grouping |
| 9 | Error Recovery | 2/4 | API errors appear in a page-level alert list; no field-level highlighting to guide where to fix |
| 10 | Help and Documentation | 1/4 | No placeholder text, no tooltips, no format hints anywhere; technical fields are cryptic without domain knowledge |

**Total: 20 / 40**

---

## Antipattern Detector (Assessment B)

Ran detector over `client/src/pages/Contacts/**`. Result: **`[]` — clean.** No gradient text, no side-stripe borders, no hero-metric templates detected.

---

## Priority Issues

### P1 — High Impact

**P1-1: Toggle button label is ambiguous**
`Index/index.tsx:112–116` — The button shows "Todos os Contatos" when inactive and "Apenas Grupos" when active. This describes *current state*, not *what clicking will do*. A user scanning quickly reads "Apenas Grupos" and interprets it as "click to show only groups" — but it already IS showing only groups. Standard convention: label describes the action (what changes on click), not the result you're in. Fix: always show "Ver Grupos" / "Ver Todos" — or use a toggle with a stable label and a visible active indicator.

**P1-2: Form validation is a no-op**
`Form/index.tsx:9–11` — `SignupSchema` only has `name: Yup.string()` with no constraints. Phone number, email, CEP — all accept any value including empty. There are no required field indicators (`*`). Users discover errors only when the API rejects — friction at the worst moment.

**P1-3: `ud` field is hidden but in form state**
`Form/index.tsx:17, 62` — `ud` is in `contactInitialValues` and `IContactFormValues`, and it's included in the submit payload, but there is no `<FieldWithError name='ud'>` rendered. Existing `ud` values on a contact silently pass through on save (neither displayed nor editable). If `ud` is still a live field, it needs a control; if it's deprecated, it should be removed from the form state to avoid confusion.

### P2 — Medium Friction

**P2-1: No placeholder text on any field**
`Form/index.tsx` — None of the 15 fields have `placeholder` attributes. Users have no hint for format expectations (e.g. "5511999999999" for phone, "01310-100" for CEP). Especially problematic for technical/non-obvious fields.

**P2-2: No loading state on Index during async fetch**
`Index/index.tsx:21–30` — `onFilter` calls `getContacts` and awaits it, but the table shows previous results (or empty state) with no loading indicator. Users see a silent gap after applying filters.

**P2-3: No required field markers**
The form accepts submit with empty name/phone. No `*` or visual cue signals which fields matter. Users won't know until the API responds.

**P2-4: Semantic grouping in Form is off**
`Form/index.tsx:280–307` — `delivery_tax` and `plugin_cart_id` live inside the "Endereço" fieldset. Both are delivery/commercial fields, not address data. They belong in a separate fieldset or back in the main section.

### P3 — Minor Polish

**P3-1: Search input lacks keyboard shortcut**
No `onKeyDown` handler for Enter on the expression input — users must click the search button. Common convention: Enter submits a search.

**P3-2: "Carregar mais" button has no disabled/loading state**
`Index/index.tsx:183–191` — While the next page is loading, the button remains clickable and could trigger duplicate requests.

**P3-3: Edit page heading before data loads**
`Edit/index.tsx` — Spinner shown correctly, but the `<h3>Editando: {contact.name}</h3>` title has no fallback — the spinner renders inside the full div with no heading context. Minor hierarchy gap.

---

## Cognitive Load Assessment

**Medium-high on the form.** 15 fields with no grouping rationale between "basic info" and "address", no progressive disclosure, and technical fields (`waId`, `landbotId`, `plugin_cart_id`, `ud`) with no help text create a wall-of-inputs experience. The fieldset split helps but the second group has scope leakage (`delivery_tax`, `plugin_cart_id` aren't address fields).

---

## Persona Red Flags

- **Non-technical operator** creating a contact: will not know what to put in `waId`, `landbotId`, `plugin_cart_id`, or `ud`. No help text or placeholder.
- **Super admin** filtering by licensee: the `SelectLicenseesWithFilter` always passes `selectedItem={null}` regardless of the current filter — the control never reflects the active licensee filter. Visual desynced from state.

---

## AI Slop Verdict

**Pass.** No generic SaaS clichés detected. Functional, product-register appropriate. No cream backgrounds, no gradient text, no hero metrics.

---

## Recommended Next Steps

1. **`/impeccable polish contacts`** — address the P1/P2 issues above as a batch
2. Key wins: fix toggle label, add Enter-key submit, add required markers + basic Yup constraints, fix `delivery_tax`/`plugin_cart_id` fieldset placement
3. `ud` field: confirm with team whether it's live or deprecated before touching
