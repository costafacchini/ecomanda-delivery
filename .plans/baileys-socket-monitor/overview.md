# Plan: Baileys Socket Monitor

**Status**: not-started
**Created**: 2026-05-29
**Last Updated**: 2026-05-29
**Estimated Demo Date**: 2026-06-13
**Assigned Dev**: Alan Costa Facchini
**Assigned QA**: unassigned

## Objective

Replace the external-webhook-only inbound flow with a persistent Baileys WebSocket per licensee that listens to `messages.upsert` (inbound messages) and `messages.update` (delivery receipts), feeding events directly into the existing BullMQ pipeline.

## Scope

### In Scope
- `BaileysSocketManager` service — per-licensee persistent socket registry with reconnect logic
- `messages.upsert` → `IngestMessengerMessage` pipeline for inbound messages (`fromMe: false`)
- `messages.update` → delivery receipt status updates (`sendedAt`, `deliveredAt`, `readAt`)
- `StartBaileysSocket` use case wiring `IngestMessengerMessage` as the message callback
- `BootBaileysSocketSessions` use case to start all active Baileys sessions at app boot
- `server.js` startup hook gated by `ENABLE_BAILEYS_SOCKET=true`
- `GetBaileysQr.js` integration — trigger persistent socket after successful QR pairing
- `parseMessageStatus` implementation in `Baileys.js` (currently a stub returning null)
- Unit tests for all new code
- KB update to `baileys-whatsapp-guide.md`

### Out of Scope
- Replacing the existing HTTP webhook endpoint (`POST /v1/messenger/message`) — webhook remains as a fallback and for non-Baileys messengers
- Routing outbound sends through the persistent socket (existing `sendMessage` ephemeral flow unchanged)
- Image, audio, video, or sticker message parsing — text only, matching existing `parseMessage` scope
- Worker process (`worker.js`) — persistent socket runs in the web process only
- Contact address-book sync — only group and individual message events, no directory import
- Multi-instance / Redis socket coordination — single-dyno assumption; multi-dyno coordination is out of scope

## Kill Criteria

- If `@whiskeysockets/baileys` v7+ drops the `ev.on('messages.upsert')` API shape, stop and re-evaluate
- If Heroku memory limits are breached by maintaining N persistent sockets (one per licensee), stop and redesign using a pooled approach
- If the reconnect loop produces credential churn that invalidates sessions in production, halt and investigate before continuing

## Phases

| Phase | Name | Tasks | Dependencies | Description |
|-------|------|-------|--------------|-------------|
| 1 | Core Infrastructure | task-01, task-02 | None | Socket lifecycle service + receipt parsing — parallel, no shared files |
| 2 | Use Case Wiring | task-03 | Phase 1 | `StartBaileysSocket` use case wiring ingest + receipt callbacks into the socket manager |
| 3 | Boot & Integration | task-04 | Phase 2 | App startup hook, QR post-pairing trigger, env flag, KB update |

## Task Summary

| Task Path | Title | Phase | Status | Depends On |
|-----------|-------|-------|--------|------------|
| phase-1/task-01-socket-manager | BaileysSocketManager service | 1 | not-started | — |
| phase-1/task-02-receipt-parsing | parseMessageStatus implementation | 1 | not-started | — |
| phase-2/task-03-start-socket-usecase | StartBaileysSocket use case | 2 | not-started | phase-1/task-01-socket-manager, phase-1/task-02-receipt-parsing |
| phase-3/task-04-boot-and-qr-integration | App boot wiring + QR integration | 3 | not-started | phase-2/task-03-start-socket-usecase |

## Branch Convention

Pattern: `plan/baileys-socket-monitor/{task-path}`

Example branches:
- `plan/baileys-socket-monitor/phase-1/task-01-socket-manager`
- `plan/baileys-socket-monitor/phase-1/task-02-receipt-parsing`
- `plan/baileys-socket-monitor/phase-2/task-03-start-socket-usecase`
- `plan/baileys-socket-monitor/phase-3/task-04-boot-and-qr-integration`

Base branch: `main`

## Key Files

| File/Directory | Relevance |
|----------------|-----------|
| `src/app/services/BaileysSocketManager.js` | NEW — core persistent socket lifecycle service |
| `src/app/plugins/messengers/Baileys.js` | Modify `parseMessageStatus` stub; socket manager reuses `buildAuthState` / `saveSession` |
| `src/app/usecases/licensees/StartBaileysSocket.js` | NEW — use case wiring ingest + receipt callbacks |
| `src/app/usecases/licensees/BootBaileysSocketSessions.js` | NEW — use case to start all active sessions at boot |
| `src/app/usecases/webhooks/IngestMessengerMessage.js` | Read-only — inbound handler called from socket manager |
| `src/app/runtime/dependencies.js` | Add `socketManager`, `startBaileysSocket`, `bootBaileysSocketSessions` |
| `src/app/usecases/licensees/GetBaileysQr.js` | Trigger persistent socket after successful QR pairing |
| `server.js` | Boot hook: call `bootBaileysSocketSessions` after DB connect |
| `docs/kb/features/baileys-whatsapp-guide.md` | Document the persistent socket feature and env flag |

## Risks

- **Reconnect storm** — If all licensees disconnect simultaneously (Heroku restart), they reconnect at once and could spike WhatsApp rate limits. Mitigation: add jittered delay in reconnect backoff.
- **Credential invalidation during reconnect** — Baileys writes creds on every `creds.update`. If the socket is reconnecting while a send is in progress, concurrent writes could corrupt the session. Mitigation: reuse the same `saveSession` logic (already serialized by Mongoose upsert), and ensure `sendMessage` still creates its own short-lived socket without touching the persistent socket's credentials.
- **Memory leak on long-running sockets** — If event listeners accumulate across reconnects. Mitigation: call `socket.ev.removeAllListeners()` before closing on reconnect, and the `stop()` method must fully clean up the socket reference.
- **Test isolation** — Socket manager is a singleton; tests must reset state between runs. Mitigation: export a factory or a `reset()` method for test use.

## Success Criteria

- [ ] A text message sent from a real WhatsApp account to a Baileys-connected licensee appears as a `Message` record in the DB without hitting the HTTP webhook
- [ ] Delivery receipt (`delivered`) updates `message.deliveredAt` on the corresponding Message record
- [ ] Read receipt updates `message.readAt`
- [ ] App boot with `ENABLE_BAILEYS_SOCKET=true` starts persistent sockets for all licensees with active sessions
- [ ] After a QR scan, the persistent socket starts automatically without requiring an app restart
- [ ] Existing webhook flow still works (no regression for non-Baileys messengers)
- [ ] Existing outbound `sendMessage` flow is unaffected
- [ ] All unit tests pass with `npx jest`
- [ ] `npx eslint .` produces no new errors
- [ ] KB doc `baileys-whatsapp-guide.md` updated with persistent socket section

## References

- **JIRA Epic**: N/A
- **Weekly Plan Brief**: N/A
- **Related Plans**: [Baileys WhatsApp Plugin](../baileys-plugin/overview.md), [Baileys Group Messaging & Directory Sync](../baileys-groups-directory/overview.md)
- **Rock Alignment**: N/A
