---
target: licensee
total_score: 20
p0_count: 0
p1_count: 2
timestamp: 2026-06-18T11-36-14Z
slug: client-src-pages-licensees
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Edit view shows blank white while loading (return null); tabs show no completion state |
| 2 | Match Between System and Real World | 2 | "E-email" typo; "Licenciado editando" is awkward; "Identifier" / "Key" without platform context |
| 3 | User Control and Freedom | 2 | No unsaved-changes guard on navigation; admin modal has no dismiss for edge cases |
| 4 | Consistency and Standards | 3 | Create uses wizard, edit uses flat tabs — same data, two mental models |
| 5 | Error Prevention | 2 | No required field indicators; errors listed below the fold after submit |
| 6 | Recognition Rather Than Recall | 3 | Tabs labeled; conditional field reveal works, but chatbot/chat keys need context |
| 7 | Flexibility and Efficiency | 1 | No bulk actions, no keyboard shortcuts, no active/inactive toggle in list |
| 8 | Aesthetic and Minimalist Design | 2 | 4 disabled webhook URL fields with verbose labels dominate the edit form Principal tab |
| 9 | Error Recovery | 2 | Toast exists; error list appears below buttons, likely off-screen on submit |
| 10 | Help and Documentation | 1 | No tooltips, no hints, no context on "Identifier"/"Key"/"URL para webhook" |
| **Total** | | **20/40** | **Acceptable — significant improvements needed** |

## Anti-Patterns Verdict

**LLM assessment**: No AI slop in the aesthetic sense — no gradient text, no hero metrics, no glassmorphism. But the surface fails by *operator slop*: it reads as a generic form admin generated from Bootstrap defaults. The design system (Signal Orange, Jost, the "Steady Operator" identity) is completely absent here. The nav bar carries the brand; everything beneath it is anonymous gray Bootstrap.

**Deterministic scan**: 1 advisory finding — rgba(0,0,0,0.5) in SelectLicenseeModal/index.tsx:34. This is the modal backdrop overlay. FALSE POSITIVE — standard Bootstrap modal pattern, not design drift.

## Overall Impression

A functional but characterless admin surface. The data architecture is sound — wizard for creation, tabs for editing, progressive disclosure of platform-specific fields — but the execution is unfinished. Biggest single opportunity: the edit form's Principal tab buries four read-only webhook URLs that operators set once and never touch again, right alongside the fields they edit daily.

## What's Working

1. Conditional field disclosure in ChatPanel and WhatsAppPanel — progressive disclosure is correctly applied.
2. Step wizard for creation — 4 named steps, progress bar, per-step Yup validation is meaningfully better than a flat form.
3. Toast confirmations on save — explicit success/failure feedback always present.

## Priority Issues

**[P1] "E-email" typo in MainPanel label**
- What: MainPanel.tsx:93 — email field label reads "E-email"
- Why it matters: Trust-eroding copy error in an admin tool
- Fix: Change to "E-mail"
- Suggested command: /impeccable clarify

**[P1] Blank page while Edit view loads**
- What: LicenseeEdit returns null while fetching data
- Why it matters: Blank white page for 100–500ms+ looks broken
- Fix: Replace return null with Bootstrap spinner
- Suggested command: /impeccable harden

**[P2] Webhook URL fieldset dominates the Principal tab**
- What: 4 disabled read-only fields with verbose labels in MainPanel.tsx:151-211
- Why it matters: System-generated values operators set once push meaningful editable fields out of view
- Fix: Collapse behind disclosure toggle or move to bottom with visual separator
- Suggested command: /impeccable layout

**[P2] Create (wizard) and Edit (tabbed form) are different flows for the same object**
- What: Different UI structures for creating vs editing a licensee
- Why it matters: Admins re-learn the interface every time they switch between create and edit
- Fix: Align labels and field order across wizard steps and edit tabs
- Suggested command: /impeccable shape

**[P2] No required field indicators anywhere**
- What: No visual marking of required fields in either form
- Why it matters: Operators don't know which fields are mandatory before submitting
- Fix: Add asterisk markers and a key note at form top
- Suggested command: /impeccable harden

## Persona Red Flags

**Alex (Admin Power User)**:
- No tab completion indicators; must remember which field is in which tab
- Index list has no quick active/inactive filter
- No keyboard shortcut to save

**Jordan (First-Timer Admin)**:
- "Identifier" and "Key" labels with no platform context hint
- "Criar +" button is informal and ambiguous
- "Licenciado editando" heading gives no identity context

**Sam (Accessibility)**:
- Webhook URL fields and apiToken use disabled rather than readonly — skipped from tab order and screen reader
- fieldset for webhook URLs has no legend

## Minor Observations

- "Licenciado editando" should be "Editando: {licensee.name}"
- col-5 layout leaves right half of desktop empty
- disabled vs readonly on apiToken
- YesNoGate "Não" button uses btn-secondary (off-brand); consider btn-outline-primary
- SelectLicenseeModal shows no current selection when re-opening

## Questions to Consider

- Would operators be better served by workflow-organized sections (Basic Info, Messaging Setup, Integrations) vs. the current database-structure tabs?
- Should webhook URLs live in a separate Developer Tools card rather than the main edit form?
- Would wizard-style step validation in the edit form reduce failed save attempts?
