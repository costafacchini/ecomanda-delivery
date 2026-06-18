---
target: the messages page
total_score: 23
p0_count: 0
p1_count: 1
timestamp: 2026-06-18T13-57-32Z
slug: client-src-pages-messages
---
---
score: 23
p0: 0
p1: 1
p2: 4
p3: 3
target: client/src/pages/Messages
---

# UX Critique — Messages Page

**Surface**: `client/src/pages/Messages/scenes/Index`
**Date**: 2026-06-18
**Score**: 23 / 40

---

## Nielsen Heuristics

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | Loading on Pesquisar/table/Carregar mais ✓; retry feedback ✓; no result count; no error toast on getMessages failure |
| 2 | Match Between System and Real World | 3/4 | Good Portuguese labels; "Enviada?" header ends with ? — informal |
| 3 | User Control and Freedom | 2/4 | No "Limpar filtros" reset button; 6 fields require manual clear one-by-one |
| 4 | Consistency and Standards | 3/4 | Consistent with app post-polish; explicit Pesquisar click is intentional |
| 5 | Error Prevention | 2/4 | No date range validation (endDate < startDate returns 0 silently); no retry confirmation |
| 6 | Recognition Rather Than Recall | 2/4 | Initial load shows empty state — user must know to click Pesquisar; no guidance |
| 7 | Flexibility and Efficiency | 2/4 | No keyboard shortcut for search; no URL state; no export; no bulk retry |
| 8 | Aesthetic and Minimalist Design | 2/4 | Asymmetric filter row for non-super users; Pesquisar button visually disconnected from filters |
| 9 | Error Recovery | 2/4 | Per-message retry UX ✓; getMessages API failures silently clear loading with no error shown |
| 10 | Help and Documentation | 1/4 | No tooltips on filter fields; no explanation of Destino/Tipo values in context |
| **Total** | | **23/40** | **Acceptable** |

---

## Anti-Patterns Verdict

**LLM**: Not AI-generated. The page is operationally honest — dense filter toolbar, information-dense table, progressive disclosure for error details. No decorative elements, no hero metrics, no gradient text.

**Deterministic scan**: `[]` — clean.

---

## Overall Impression

The core search-and-inspect pattern works, and the error retry UX (per-message loading → success/error feedback) is genuinely well-done. The main weak spots are at the system edges: API errors in the fetch path are invisible, the filter panel has no reset path, and the initial blank state gives no orientation. Fixing those three would cover 80% of the UX debt.

---

## What's Working

1. **Per-message retry feedback** — `retryState` per message ID with loading/success/error states and the `<details>` error disclosure is exactly the right affordance for an ops/debug page. Compact, progressive, recoverable.
2. **Loading states on all async paths** — Pesquisar, table row, and Carregar mais all disable or show spinners. Users can't double-fire any of these.
3. **KIND_LABELS / DESTINATION_LABELS maps** — The table now shows "Texto", "WhatsApp" instead of "text", "to-messenger". Small change, meaningful scan improvement.

---

## Priority Issues

### [P1] API errors in `getMessages` are invisible
**File**: `index.tsx:79–88` (`onFilter`)
**Why it matters**: If the API call rejects (network error, 500, timeout), `setLoading(false)` runs in `finally`, the button re-enables, and the user sees... the previous empty state or stale results. No toast, no alert, no inline message. On a debug/ops page users rely on, a silent failure looks identical to "no results" — they'll keep retrying filters and blame the data, not the connection.
**Fix**: Catch errors in `onFilter`'s `try/catch`, show a toast (`toast.error(...)`) or set a local `error` state.
**Suggested command**: `/impeccable harden messages`

### [P2] No "Limpar filtros" reset button
**File**: `index.tsx` — filter section
**Why it matters**: The filter panel has 6 fields (date×2, kind, destination, contact, optional licensee) plus a checkbox. Resetting to the default state requires manually clearing each field. On an ops page where users switch between "all errors in the last hour" and "all messages from contact X today", this is high-friction.
**Fix**: Add a "Limpar filtros" button that resets `filters` to the initial state object.
**Suggested command**: `/impeccable polish messages`

### [P2] Initial load shows empty state without guidance
**File**: `index.tsx:163–169`
**Why it matters**: On first render, `records` is `[]` and loading is `false`, so the empty state row "Nenhuma mensagem encontrada." shows immediately — before the user has searched for anything. A first-time user will read this and think the system has no messages. The empty state copy is only accurate post-search.
**Fix**: Distinguish between "not yet searched" and "searched and found nothing" with a boolean `hasSearched` flag. Pre-search: show "Aplique os filtros e clique em Pesquisar para ver as mensagens." Post-search with no results: "Nenhuma mensagem encontrada."
**Suggested command**: `/impeccable polish messages`

### [P2] Date range not validated
**File**: `index.tsx` — filter inputs
**Why it matters**: A user can set `endDate` before `startDate`. The API will return 0 results with no explanation. The user sees "Nenhuma mensagem encontrada." and doesn't know if the problem is the data or the date range.
**Fix**: Before calling `onFilter`, validate that `startDate <= endDate` and show an inline error if not.
**Suggested command**: `/impeccable harden messages`

### [P2] Asymmetric filter layout for non-super users
**File**: `index.tsx:186–206`
**Why it matters**: When `role !== 'super'`, the licensee filter is hidden but the contact filter still occupies `col-6`, leaving an empty right half of the row. The contact dropdown is narrow and undersized compared to the space available.
**Fix**: Apply `col-12` to the contact filter when no licensee filter is shown (conditional width).
**Suggested command**: `/impeccable layout messages`

---

## Persona Red Flags

**Alex (Power User)** — filtering for all errors in the last 24 hours:
- Can't submit search with Enter key — must move mouse to click Pesquisar.
- Wants to share the current filter state with a colleague — URL params aren't updated, so the link goes to the default view.
- Has 50 error messages — no "retry all" bulk action. Must click Reenviar 50 times.

**Riley (Stress Tester)** — sets endDate to yesterday, startDate to today:
- Gets "Nenhuma mensagem encontrada." with no indication the date range is the problem.
- Simulates a network error (API down): loading clears, previous empty state shows, no error message. Looks identical to "no results."
- Refreshes mid-result: `records` state is gone, table shows empty state. No persistence.

**Sam (Accessibility-Dependent)** — tabs through filters:
- No `aria-live` region on the results table — screen reader doesn't announce when results load or how many were found.
- Sector badge (`bg-secondary`) on contact names may not meet contrast on striped row backgrounds.
- The `<details>` error expansion is keyboard accessible ✓ — this is good.

---

## Minor Observations

- "Enviada?" column header ends with `?` — informal. "Enviada" or "Envio" reads cleaner.
- No result count shown after search — "Carregando X mensagens" or "X resultados" would orient users.
- Pesquisar button sits in its own row, right-aligned. Visually there's no strong signal that it acts on the filters above — a subtle border/divider between the filter area and the button would clarify the relationship.
- Cart price format uses `$` (USD) — in a Brazilian Portuguese app this likely should be `R$`. Worth confirming with the team.
