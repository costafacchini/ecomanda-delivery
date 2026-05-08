# Plan: Dashboard Widgets

**Status**: not-started
**Created**: 2026-05-07
**Last Updated**: 2026-05-07
**Estimated Demo Date**: N/A
**Assigned Dev**: Alan Costa Facchini
**Assigned QA**: unassigned
**Master Plan**: None

## Objective

Replace the empty `Dashboard` stub with role-aware stat widgets. Each card is self-contained — it fires its own independent REST request and has its own loading/error state. All responses are cached in Redis for 10 minutes to avoid slow repeated aggregations.

## User Kinds

| Kind | Condition | Cards |
|------|-----------|-------|
| **Super** | `isSuper: true`, no `licensee` ref | 5 cards — platform-wide metrics |
| **Licensee** | `isSuper: false`, has `licensee` ref | 3 cards — scoped to their licensee |

## API Contract

One endpoint per card. All under `/resources/dashboard/`. The controller resolves user kind from `req.userId` on every request and gates access accordingly (403 if wrong kind).

### Super endpoints (5)

| Endpoint | Card | Cache key |
|----------|------|-----------|
| `GET /resources/dashboard/licensees` | Licenciados | `dashboard:super:licensees` |
| `GET /resources/dashboard/message-volume` | Volume de Mensagens | `dashboard:super:message-volume` |
| `GET /resources/dashboard/delivery-rate` | Taxa de Entrega | `dashboard:super:delivery-rate` |
| `GET /resources/dashboard/queue` | Fila | `dashboard:super:queue` |
| `GET /resources/dashboard/conversations` | Conversas | `dashboard:super:conversations` |

### Licensee endpoints (3)

| Endpoint | Card | Cache key |
|----------|------|-----------|
| `GET /resources/dashboard/contacts` | Contatos | `dashboard:licensee:{licenseeId}:contacts` |
| `GET /resources/dashboard/messages-today` | Mensagens Hoje | `dashboard:licensee:{licenseeId}:messages-today` |
| `GET /resources/dashboard/messages-per-day` | Mensagens por Dia | `dashboard:licensee:{licenseeId}:messages-per-day` |

### Response shapes

**`/licensees`**
```json
{ "total": 15, "active": 12, "by_kind": { "demo": 3, "free": 5, "paid": 7 } }
```

**`/message-volume`**
```json
{
  "per_day": [{ "date": "2026-05-01", "count": 150 }],
  "per_hour": [{ "hour": "2026-05-07T14", "count": 45 }],
  "peak_throughput": 87,
  "avg_transfer_rate": 12.5
}
```

**`/delivery-rate`**
```json
{ "sent_today": 423, "failed_today": 5, "sent_pct": 98.8, "failed_pct": 1.2 }
```

**`/queue`**
```json
{ "pending_messages": 12, "avg_time_in_queue_seconds": 4.2 }
```

**`/conversations`**
```json
{
  "started_today": 34, "ended_today": 28,
  "avg_messages_per_conversation": 6.3, "avg_duration_seconds": 182.4
}
```

**`/contacts`**
```json
{ "total": 89, "in_chatbot": 12 }
```

**`/messages-today`**
```json
{ "sent_today": 45, "failed_today": 2, "sent_pct": 97.8, "failed_pct": 2.2 }
```

**`/messages-per-day`**
```json
{ "per_day": [{ "date": "2026-05-01", "count": 38 }] }
```

### `POST /resources/messages/:id/resend`

Resets message state (`sended: false`, `error: null`, `sendedAt: null`) and re-adds to Bull queue (`send-message-to-messenger`). Returns 200 with updated message, 403 for cross-licensee attempts, 404 if not found.

## Caching

- **Store**: Redis (`redisConnection` from `src/config/redis.js`)
- **TTL**: 600 seconds (10 minutes)
- **Pattern** (used in every dashboard action):
  ```js
  const cached = await redisConnection.get(cacheKey)
  if (cached) return res.status(200).json(JSON.parse(cached))
  // compute...
  await redisConnection.setex(cacheKey, 600, JSON.stringify(data))
  return res.status(200).json(data)
  ```
- Super keys are **global** (same data for all super users)
- Licensee keys are **scoped** by `licenseeId`

## Scope

### In Scope
- Room schema: `closedAt: Date` + update 5 close sites
- 8 dashboard endpoints + 1 resend endpoint, all in `DashboardController`
- Redis caching (10 min TTL) on all dashboard endpoints
- Frontend: 5 or 3 independent card components (based on user kind), each with own fetch + loading + error state
- Clickable failed-count → Bootstrap modal with resend buttons

### Out of Scope
- Socket.IO / real-time push — REST only
- Queue size, Consumer delay — dropped
- Tier 2 / Tier 3 widgets (carts, orders, revenue) — follow-on
- Charts library — plain Bootstrap cards + tables only

## Phases

| Phase | Name | Tasks | Dependencies | Description |
|-------|------|-------|--------------|-------------|
| 1 | Schema | task-01 | None | Add `closedAt` to Room + update close logic in plugins |
| 2 | Backend | task-02 | Phase 1 | 8 dashboard endpoints + resend endpoint + Redis caching + specs |
| 3 | Frontend | task-03 | Phase 2 | Independent card components + resend modal |

## Task Summary

| Task Path | Title | Phase | Status | Depends On |
|-----------|-------|-------|--------|------------|
| phase-1/task-01-room-schema | Room schema — closedAt field | 1 | not-started | — |
| phase-2/task-02-backend | Backend — dashboard endpoints + resend + caching | 2 | not-started | phase-1/task-01-room-schema |
| phase-3/task-03-frontend | Frontend — independent card components + resend modal | 3 | not-started | phase-2/task-02-backend |

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
| `src/app/controllers/DashboardController.js` | 8 dashboard actions + resend (Phase 2) |
| `src/app/controllers/MessagesController.js` | Add resend action (Phase 2) |
| `src/app/routes/resources-routes.js` | Register all 9 routes (Phase 2) |
| `src/config/redis.js` | `redisConnection` — used for caching (read-only ref) |
| `client/src/pages/Dashboard/index.js` | Renders card components (Phase 3) |
| `client/src/services/dashboard.js` | 8 service functions (Phase 3) |
| `client/src/services/message.js` | Add `resendMessage` (Phase 3) |

## Risks

- One extra DB read per request to resolve user kind — acceptable; could be eliminated later by encoding `isSuper`/`licenseeId` in the JWT.
- Cache invalidation: stats are stale for up to 10 minutes after data changes — acceptable for a dashboard.
- Rooms closed before Phase 1 ships will have no `closedAt` — `ended_today` and `avg_duration_seconds` will undercount until backfill or naturally over time.
- `avg_time_in_queue_seconds` excludes messages where `sendedAt` was never set.
- Resend resets message state; if the messenger is offline it will fail again silently.

## Success Criteria

- [ ] 8 dashboard endpoints return correct data for the right user kind; 403 for wrong kind
- [ ] All responses are served from Redis cache on repeat requests within 10 minutes
- [ ] Each frontend card loads independently — slow cards don't block fast ones
- [ ] Failed stat opens modal; resend removes row and decrements count
- [ ] `avg_duration_seconds` uses `closedAt`
- [ ] All existing tests pass (`npx jest`)
- [ ] `npx eslint .` reports no new errors

## References

- **JIRA Epic**: N/A
- **Weekly Plan Brief**: N/A
- **Related Plans**: remove-pdv (may touch Message/Room models — coordinate if running in parallel)
- **Rock Alignment**: N/A
