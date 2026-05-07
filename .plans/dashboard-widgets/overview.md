# Plan: Dashboard Widgets

**Status**: not-started
**Created**: 2026-05-07
**Last Updated**: 2026-05-07
**Estimated Demo Date**: N/A
**Assigned Dev**: Alan Costa Facchini
**Assigned QA**: unassigned
**Master Plan**: None

## Objective

Replace the empty `Dashboard` stub with role-aware stat widgets fetched via REST. Super users see platform-wide operational metrics with a clickable failed-messages resend flow; licensee-linked users see their own scoped data.

## User Kinds

| Kind | Condition | Dashboard focus |
|------|-----------|-----------------|
| **Super** | `isSuper: true`, no `licensee` ref | Platform-wide: licensees, message volume, delivery rate, queue health, conversations |
| **Licensee** | `isSuper: false`, has `licensee` ref | Scoped: their contacts + messages |

## API Contract

### `GET /resources/dashboard/stats`

**Super user response:**
```json
{
  "kind": "super",
  "licensees": {
    "total": 15, "active": 12,
    "by_kind": { "demo": 3, "free": 5, "paid": 7 }
  },
  "message_volume": {
    "per_day": [{ "date": "2026-05-01", "count": 150 }],
    "per_hour": [{ "hour": "2026-05-07T14", "count": 45 }],
    "peak_throughput": 87,
    "avg_transfer_rate": 12.5
  },
  "delivery_rate": {
    "sent_today": 423, "failed_today": 5,
    "sent_pct": 98.8, "failed_pct": 1.2
  },
  "queue": {
    "pending_messages": 12,
    "avg_time_in_queue_seconds": 4.2
  },
  "conversations": {
    "started_today": 34, "ended_today": 28,
    "avg_messages_per_conversation": 6.3,
    "avg_duration_seconds": 182.4
  }
}
```

**Licensee user response:**
```json
{
  "kind": "licensee",
  "contacts": { "total": 89, "in_chatbot": 12 },
  "messages": {
    "sent_today": 45, "failed_today": 2,
    "per_day": [{ "date": "2026-05-01", "count": 38 }]
  }
}
```

### `POST /resources/messages/:id/resend`

Resets message state (`sended: false`, `error: null`, `sendedAt: null`) and re-adds to Bull queue (`send-message-to-messenger`).
Returns 200 with updated message, 403 if licensee user attempts to resend another licensee's message, 404 if not found.

## Scope

### In Scope
- Room schema: `closedAt: Date` field + update 5 close sites across 3 plugin files
- `GET /resources/dashboard/stats` — single endpoint, role-branched
- `POST /resources/messages/:id/resend` — resets and re-queues failed message
- Super widgets: licensees, message volume (day/hour/peak/rate), delivery rate (counts+%), queue (pending+avgTime), conversations (started/ended/avgMsgs/avgDuration)
- Licensee widgets: contacts, messages today, messages per day
- Clickable failed-messages card → Bootstrap modal with per-row resend buttons

### Out of Scope
- Socket.IO / real-time push — REST only (decided 2026-05-07)
- Queue size, Consumer delay — dropped (decided 2026-05-07)
- Tier 2 / Tier 3 widgets (carts, orders, revenue) — follow-on
- Charts library — plain Bootstrap cards + tables only

## Phases

| Phase | Name | Tasks | Dependencies | Description |
|-------|------|-------|--------------|-------------|
| 1 | Schema | task-01 | None | Add `closedAt` to Room + update close logic in plugins |
| 2 | Backend | task-02 | Phase 1 | DashboardController + resend endpoint + specs |
| 3 | Frontend | task-03 | Phase 2 | Dashboard page + resend modal |

## Task Summary

| Task Path | Title | Phase | Status | Depends On |
|-----------|-------|-------|--------|------------|
| phase-1/task-01-room-schema | Room schema — closedAt field | 1 | not-started | — |
| phase-2/task-02-backend | Backend — DashboardController + resend endpoint | 2 | not-started | phase-1/task-01-room-schema |
| phase-3/task-03-frontend | Frontend dashboard widgets + resend modal | 3 | not-started | phase-2/task-02-backend |

## Branch Convention

Pattern: `plan/dashboard-widgets/{task-path}`

Branches:
- `plan/dashboard-widgets/phase-1/task-01-room-schema`
- `plan/dashboard-widgets/phase-2/task-02-backend`
- `plan/dashboard-widgets/phase-3/task-03-frontend`

Base branch: `main`

## Key Files

| File/Directory | Relevance |
|----------------|-----------|
| `src/app/models/Room.js` | Add `closedAt: Date` (Phase 1) |
| `src/app/plugins/chats/Rocketchat.js` | 2 close sites (Phase 1) |
| `src/app/plugins/chats/Chatwoot.js` | 2 close sites (Phase 1) |
| `src/app/plugins/chatbots/Landbot.js` | 1 close site (Phase 1) |
| `src/app/controllers/DashboardController.js` | New controller (Phase 2) |
| `src/app/controllers/MessagesController.js` | Add resend action (Phase 2) |
| `src/app/routes/resources-routes.js` | Register both routes (Phase 2) |
| `client/src/pages/Dashboard/index.js` | Implement widgets + modal (Phase 3) |
| `client/src/services/dashboard.js` | New service (Phase 3) |
| `client/src/services/message.js` | Add resendMessage (Phase 3) |

## Risks

- JWT payload only contains `user._id` — one extra DB read per stats call.
- `avg_transfer_rate` = `total messages / 24` — messages-per-hour average, not byte rate.
- `ended_today` uses `closedAt` (accurate after Phase 1); existing rooms closed before Phase 1 ships will not have `closedAt` set.
- `avg_time_in_queue_seconds` excludes messages where `sendedAt` was never set (permanently failed).
- Resend resets `sended`, `error`, and `sendedAt` — if the messenger plugin is offline the message will fail again silently; acceptable for now.

## Success Criteria

- [ ] Super user sees all 5 widget sections with real data
- [ ] Licensee user sees 3 scoped widget cards
- [ ] Failed stat in Delivery Rate card opens modal with resend buttons
- [ ] Successful resend removes the row and decrements the failed count in the card
- [ ] `avg_duration_seconds` uses `closedAt`, not `updatedAt`
- [ ] Resend returns 403 for cross-licensee attempts
- [ ] All existing tests pass (`npx jest`)
- [ ] `npx eslint .` reports no new errors

## References

- **JIRA Epic**: N/A
- **Weekly Plan Brief**: N/A
- **Related Plans**: remove-pdv (may touch Message/Room models — coordinate if running in parallel)
- **Rock Alignment**: N/A
