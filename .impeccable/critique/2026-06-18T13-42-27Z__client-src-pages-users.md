---
target: the users page
total_score: 21
p0_count: 0
p1_count: 3
timestamp: 2026-06-18T13-42-27Z
slug: client-src-pages-users
---
---
score: 21
p0: 0
p1: 3
p2: 4
p3: 2
target: client/src/pages/Users
---

# UX Critique — Users Page

**Surface**: `client/src/pages/Users` (Index, Form, Edit, New)
**Date**: 2026-06-18
**Score**: 21 / 40

---

## Nielsen Heuristics

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2/4 | Loading in Index/Edit ✓; submit button shows no loading on save |
| 2 | Match Between System and Real World | 3/4 | Good Portuguese labels; role names are domain-standard |
| 3 | User Control and Freedom | 2/4 | Back button works; no undo, no unsaved-changes guard |
| 4 | Consistency and Standards | 3/4 | Consistent post-polish; "Ativo" inline with Nome is the odd one out |
| 5 | Error Prevention | 1/4 | Yup schema: name/email/password all Yup.string() — not required, no format constraints |
| 6 | Recognition Rather Than Recall | 2/4 | Role options visible; no hints on password requirements or role capabilities |
| 7 | Flexibility and Efficiency | 2/4 | Enter key search ✓; no keyboard shortcuts, no bulk actions |
| 8 | Aesthetic and Minimalist Design | 3/4 | Clean layout; "Ativo" checkbox inline with Nome reads as paired |
| 9 | Error Recovery | 2/4 | API errors shown in page-level alert; no inline field errors |
| 10 | Help and Documentation | 1/4 | No password hints, no role descriptions, no contextual help |
| **Total** | | **21/40** | **Acceptable** |

---

## Anti-Patterns Verdict

**LLM assessment**: Not AI-generated. Functional, product-register appropriate. No cream backgrounds, no gradient text, no hero metrics, no identical card grids. Layout is straight Bootstrap table + form — undecorated and honest.

**Deterministic scan**: `[]` — clean. No antipatterns detected across all four files.

---

## Overall Impression

The page is functionally correct and visually consistent post-polish. The main problem is not aesthetic — it's behavioral: a silent checkbox bug means the "Ativo" toggle doesn't actually work, validation prevents zero errors before a round-trip to the API, and the table hides the most operationally important column (user role). The form is well-organized; fixing these three issues would close most of the gap.

---

## What's Working

1. **Progressive role-based disclosure** — The Licenciado field only appears when the role requires it, and Yup enforces it as required in that case. Smart and tight.
2. **Consistent layout with the rest of the app** — Post-polish, the Users form now matches the Contacts form pattern (col-8 fields, mb-3 rows, mb-4 fieldsets). The app now reads as one coherent product.
3. **Loading and empty states** — Index has a spinner and empty-state row; Edit has a spinner. The table never flashes blank.

---

## Priority Issues

### [P1] "Ativo" checkbox has no `name` attribute
**File**: `Form/index.tsx:84`
**Why it matters**: Formik's `handleChange` uses `event.target.name` to find the field to update. The checkbox has `id='active'` but no `name='active'`. Without `name`, toggling the checkbox calls `handleChange` but updates nothing in form state — `formik.values.active` stays at its initial value. The control *looks* interactive but silently fails.
**Fix**: Add `name='active'` to the checkbox input.
**Suggested command**: `/impeccable polish users`

### [P1] Validation schema has no required constraints
**File**: `Form/index.tsx:31–42`
**Why it matters**: `name`, `email`, and `password` are all `Yup.string()` with no `.required()`. A user can save with all three blank; the API rejects it after a round-trip. Required markers don't exist on any field except Licenciado. Users discover missing data only from an API error.
**Fix**: Add `.required()` to name, email (and conditionally to password for new-user creation), add `*` markers to those labels.
**Suggested command**: `/impeccable harden users`

### [P1] No loading state on form save
**File**: `New/index.tsx:24`, `Edit/index.tsx:55`
**Why it matters**: The submit button stays fully clickable after the first click. On slow connections or API latency, users can double-submit — creating or updating the user twice. There's no visual feedback that anything is happening.
**Fix**: Track a `saving` state; disable the submit button and show a spinner while the API call is in-flight.
**Suggested command**: `/impeccable polish users`

### [P2] Table is missing the Role column
**File**: `Index/index.tsx` — table headers/rows
**Why it matters**: The table shows Nome, E-mail, and Ativo — but not the user's role. An admin managing users needs to know who is an Agente vs. Supervisor at a glance, without clicking into each record. Role is the primary access-control dimension; it should be visible in the list.
**Fix**: Add `<th>Perfil</th>` and render a human-readable label (`Agente`, `Supervisor`, `Administrador`, `Super`) in each row.
**Suggested command**: `/impeccable polish users`

### [P2] "Ativo" checkbox inline with Nome field
**File**: `Form/index.tsx:69–96`
**Why it matters**: Nome and Ativo share the same row (`col-8` + `col-4`). The vertical alignment with `mt-4` is approximate and breaks at different font/zoom scales. More importantly, it visually implies a paired relationship between "name" and "active status" — they aren't semantically linked. Every other boolean in the app (contacts' "Conversando com chatbot?") gets its own full-width row.
**Fix**: Move the Ativo checkbox to its own `row mb-3`, matching the contacts pattern.
**Suggested command**: `/impeccable polish users`

---

## Persona Red Flags

**Alex (Power User)** — walks through the user list trying to identify roles:
- Table has no Role column. Must click edit on each user to see their role. For a list of 50 users, this is 50 clicks.
- No bulk-role assignment. No keyboard navigation in the table.
- Double-submit is possible; no debounce or disable on the save button.

**Sam (Accessibility-Dependent)** — tabs through the form to create a user:
- `name='active'` missing on the checkbox: the screen reader announces it as a checkbox but toggling it changes nothing. User doesn't know why it's broken.
- Email has `placeholder`, password does not — inconsistent verbosity across adjacent fields.
- ErrorMessage for Licenciado renders `component='div'` — screen reader will announce validation errors ✓ (good). Other fields produce no inline announcement.

**Riley (Stress Tester)** — creates a user with all fields blank, then submits:
- Form submits. API rejects. Red alert appears at top listing API error messages. This works — but there's no inline indication of which field is wrong. Alert appears above the fieldset with no scroll-back, so on short viewports the user may not see it.
- Saving twice fast (double-click the Salvar button) may create a duplicate user.

---

## Minor Observations

- `"Ativo"` column in the table shows `"Sim"` / `"Não"` as plain text. A small badge (`badge bg-success` / `badge bg-secondary`) would make scanning faster without adding visual noise.
- The role dropdown provides no description of what each role can do. A first-time admin setting up users has no in-product guidance.
- `useParams` returns `id` typed as `string | undefined`; the `!` non-null assertion on `userId!` is technically sound here (route always provides it) but `userId` could be renamed `contactId` → it's `userId` now, good.

---

## Questions to Consider

- "What if role were visible in the table — would admins ever need to use the edit form just to check permissions?"
- "The same form handles both create and edit. Should password be optional on edit (✓ it is) but required on create? The current schema doesn't distinguish."
- "What happens when a super admin accidentally assigns themselves a non-super role — is there a guard?"
