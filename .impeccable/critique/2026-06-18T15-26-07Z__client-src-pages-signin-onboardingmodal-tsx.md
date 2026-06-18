---
target: the onboarding page
total_score: 22
p0_count: 0
p1_count: 2
timestamp: 2026-06-18T15-26-07Z
slug: client-src-pages-signin-onboardingmodal-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Step pills + submit spinner present; no live field feedback while typing |
| 2 | Match System / Real World | 2 | "Identifier", "Key", "Baileys", "Dialog360" — jargon with no explanation |
| 3 | User Control and Freedom | 3 | Cancel/Back/× work; Escape key unhandled; no save-and-resume |
| 4 | Consistency and Standards | 3 | Bootstrap patterns consistent; no form element breaks Enter-to-submit |
| 5 | Error Prevention | 2 | Yup schemas gate steps; document/phone have no format hints; no password strength |
| 6 | Recognition Rather Than Recall | 2 | Step titles help; zero inline hints on where to find integration credentials |
| 7 | Flexibility and Efficiency | 1 | No Enter-key advancement; no shortcuts; strictly linear wizard |
| 8 | Aesthetic and Minimalist Design | 3 | Focused per-step layout; conditional fields appear/disappear without transition |
| 9 | Error Recovery | 2 | Descriptive field errors; step-level footer list can double-display with inline errors |
| 10 | Help and Documentation | 1 | No inline help on credential fields; no doc links; no tooltips on technical terms |
| **Total** | | **22/40** | **Acceptable — significant improvements needed** |

## Priority Issues

**[P1] No form element — Enter key is a dead key**
Wrap Formik render children in a form element with onSubmit that calls handleNext or submitForm depending on isLast. Enter in any field currently does nothing.

**[P1] No inline help on integration credential fields**
Identifier, Key, Token, URL fields show no hint of where to find them. Add helper text or placeholder examples for each provider. Highest abandonment risk in the flow.

**[P2] Document and phone fields have no format hints**
Brazilian admins don't know expected CPF/CNPJ or phone format. Add placeholder examples.

**[P2] Empty option in selects has no label**
All four selects render a blank first option. Change to disabled placeholder: "Selecione..."

**[P2] Escape key does not close the modal**
No onKeyDown handler. Add Escape handling to outermost modal div.

## Persona Red Flags

- Jordan abandons at integration credential step — no hints on Identifier/Key
- Casey must scroll on mobile to reach footer action buttons on long steps
- Sam: step progress pills are div elements with no aria-label or aria-live region

## Minor Observations

- renderStepContent is 200+ lines; split into named step sub-components
- useSectors checkbox label is too long; wraps on narrow screens
- btn-success may not map to Clearline Teal depending on Bootstrap theme config
