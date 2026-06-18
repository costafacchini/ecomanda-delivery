---
target: dashboard page
total_score: 22
p0_count: 0
p1_count: 3
timestamp: 2026-06-18T14-28-11Z
slug: client-src-pages-dashboard
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | FailedMessagesModal Reenviar button has no loading/disabled state |
| 2 | Match System / Real World | 3 | Field named sent_today shown when date range ≠ today; "Pico (msg/hora)" may confuse non-technical admins |
| 3 | User Control and Freedom | 2 | No retry on card errors (full-page reload required); Fechar conversa is irreversible with no confirmation |
| 4 | Consistency and Standards | 3 | One label says "Falhas no período" while others omit "no período" |
| 5 | Error Prevention | 2 | No confirmation before closing a room; date range inputs accept invalid ranges; Reenviar double-click risk |
| 6 | Recognition Rather Than Recall | 3 | Metrics labeled inline; Baileys flow requires user to know WhatsApp menu path |
| 7 | Flexibility and Efficiency | 2 | No date presets (Today/This Week/This Month); no keyboard shortcuts |
| 8 | Aesthetic and Minimalist Design | 2 | All 6 super cards have identical visual weight; no page heading; SuperMessageVolumeCard has two nested tables |
| 9 | Error Recovery | 1 | All cards show identical "Erro ao carregar dados." with no retry; room-close errors have no undo |
| 10 | Help and Documentation | 1 | No tooltips for Pico/Taxa de Entrega/Tempo médio; Baileys QR is the only card with guidance |
| **Total** | | **22/40** | **Acceptable — significant improvements needed** |

## Anti-Patterns Verdict

**LLM assessment**: No hard banned patterns. Cards use big number + muted label (adjacent to hero-metric template but without gradient accents). Real issue is uniform visual weight — no card reads as primary. For a product-register admin dashboard this is appropriate structure executed without hierarchy.

**Deterministic scan**: 1 finding — rgba(0,0,0,0.5) at FailedMessagesModal.tsx:76. False positive — standard Bootstrap modal backdrop.

## Priority Issues

**[P1] No retry affordance on card errors** — User must full-page reload for any transient API failure. Fix: Add Tentar novamente button to error state of all cards.

**[P1] Fechar conversa has no confirmation and no undo** — Closing a live customer conversation is one click with no recovery. Fix: Two-stage confirmation or window.confirm().

**[P1] No dashboard page heading** — Every other page has an h3 header; dashboard starts directly with cards. Screen readers have no page landmark. Fix: Add h3 Dashboard/Visão Geral to all return branches.

**[P2] FailedMessagesModal Reenviar has no loading/disabled state** — Duplicate resend requests possible. Fix: Track resending state per row.

**[P2] Empty table bodies when date range has no data** — SuperMessageVolumeCard and LicenseeMessagesPerDayCard render table headers with zero rows. Fix: Add empty-state row.

## Persona Red Flags

**Alex (Power User)**: Date range requires manual entry every session — no presets. No refresh button on SuperOpenRoomsCard for new rooms.

**Sam (Accessibility)**: Error states are plain p.text-danger with no role="alert" — screen reader won't announce failures. Focus management after closing a room not handled.

**Riley (Stress Tester)**: Date range endDate < startDate fires API call silently. FailedMessagesModal Reenviar button allows duplicate clicks.

## Minor Observations

- sticky-top bg-white hardcodes white on SuperOpenRoomsCard thead
- sent_pct/failed_pct have no null guard — renders "(null%)" if API returns null
- BaileysSetupCard: Gerar novo QR Code appears while valid QR is displayed
