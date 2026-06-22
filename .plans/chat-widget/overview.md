# Plan: Chat Widget

**Status**: not-started
**Created**: 2026-06-22
**Last Updated**: 2026-06-22
**Assigned Dev**: Alan Costa Facchini
**PR Strategy**: single

## Objective

Build an embeddable chat widget that visitors on external client websites can use to send and receive messages with a licensee's ecomanda agents. The widget is installed via a single `<script>` tag, pops open an Intercom-style chat, and routes messages through the existing LocalChat plugin.

## Scope

### In Scope
- `web` contact type on the Contact model + `widgetSessionToken` identifier field
- Three public backend endpoints (session, send message, poll messages) under `/widget/:apiToken/*`
- Guard in `SendMessageToMessenger` to skip messenger delivery for web contacts
- React + Vite widget bundle (IIFE) served as `/widget.js` from Express static
- Visitor identification via name + email form shown on first open
- Reply delivery to widget via polling (GET every 5 seconds)

### Out of Scope
- Real-time Socket.IO delivery to widget — polling is sufficient for MVP
- File/image upload from widget — text-only
- Branding customisation by licensee (colours, logo) — not in this iteration
- Conversation history across sessions (beyond current open room) — cleared on new session
- Mobile-specific optimisations for the widget popup

## Kill Criteria

- If Socket.IO real-time delivery becomes a hard requirement before Phase 4 ships — revisit architecture
- If licensee count grows to a point where polling creates measurable backend load — switch to Server-Sent Events or Socket.IO

## Phases

| Phase | Name | Tasks | Dependencies | Description |
|-------|------|-------|--------------|-------------|
| 1 | Foundation | task-01, task-02 | None | Contact model extension + message query method |
| 2 | Use Cases | task-03, task-04, task-05 | Phase 1 | Three widget use cases (session, send, poll) |
| 3 | Backend Routes & Guard | task-06, task-07 | Phase 2 | Widget router + web-contact messenger bypass |
| 4 | Widget Frontend | task-08, task-09, task-10, task-11 | Phase 3 | React+Vite bundle, UI, hooks, Express static serve |

## Task Summary

| Task Path | Title | Phase | Status | Depends On |
|-----------|-------|-------|--------|------------|
| phase-1/task-01-contact-web-type | Contact: web type + widgetSessionToken | 1 | not-started | — |
| phase-1/task-02-message-findbyroom | MessageRepository: findByRoom query | 1 | not-started | — |
| phase-2/task-03-create-widget-session | Use case: CreateWidgetSession | 2 | not-started | phase-1/task-01-contact-web-type |
| phase-2/task-04-send-widget-message | Use case: SendWidgetMessage | 2 | not-started | phase-1/task-01-contact-web-type |
| phase-2/task-05-get-widget-messages | Use case: GetWidgetMessages | 2 | not-started | phase-1/task-02-message-findbyroom |
| phase-3/task-06-widget-router | Widget router + CORS + 3 endpoints | 3 | not-started | phase-2/task-03, task-04, task-05 |
| phase-3/task-07-web-contact-guard | SendMessageToMessenger: skip web contacts | 3 | not-started | phase-2/task-03-create-widget-session |
| phase-4/task-08-widget-skeleton | Widget project skeleton (Vite IIFE) | 4 | not-started | phase-3/task-06-widget-router |
| phase-4/task-09-widget-components | Widget React UI components | 4 | not-started | phase-4/task-08-widget-skeleton |
| phase-4/task-10-widget-hooks-mount | Widget hooks + IIFE mount script | 4 | not-started | phase-4/task-09-widget-components |
| phase-4/task-11-express-static | Express static serve widget.js | 4 | not-started | phase-4/task-10-widget-hooks-mount |

## Branch Convention

Pattern: `plan/chat-widget/{task-path}`

Example branches:
- `plan/chat-widget/phase-1/task-01-contact-web-type`
- `plan/chat-widget/phase-3/task-06-widget-router`

Base branch: `main`

## Key Files

| File/Directory | Relevance |
|----------------|-----------|
| `src/app/models/Contact.ts` | Add `web` type + `widgetSessionToken` field |
| `src/app/models/Contact.spec.ts` | Tests for new fields |
| `src/app/repositories/contact.ts` | NormalizePhone bypass for web type in memory repo |
| `src/app/repositories/message.ts` | Add `findByRoom` query method |
| `src/app/services/SendMessageToMessenger.ts` | Guard: skip messenger send for web contacts |
| `src/app/usecases/widget/` | New use case directory (3 classes) |
| `src/app/routes/widget-routes.ts` | New router for widget API |
| `src/config/routes.ts` | Register widget router at `/widget` |
| `widget/` | New top-level directory: React+Vite widget bundle |

## Risks

- `ContactRepositoryMemory.normalizeContactFields` and `Contact.ts` pre-save hook both apply NormalizePhone based on `number.includes('@')` — email addresses trigger this. Both must be patched to guard for `type === 'web'`.
- `SendMessageToMessenger` currently only populates `licensee` on the message. To check contact type, the populate call must also include `contact`. Verify this doesn't break existing tests.
- The widget's IIFE bundle must not pollute the host page's global scope beyond a single `window.EcomandaWidget` namespace.
- Vite IIFE build targeting a single `widget.js` file requires `build.lib` config — verify CSS is either inlined or injected into Shadow DOM to avoid host-page style conflicts.

## Success Criteria

- [ ] Widget loads via `<script src="/widget.js" data-licensee="TOKEN">` on any HTML page
- [ ] Visitor submits name + email → session persists in localStorage
- [ ] Visitor sends message → appears in agent's LocalChat dashboard within 2s
- [ ] Agent replies in dashboard → appears in widget within 10s (polling interval)
- [ ] Web contacts do NOT trigger a WhatsApp messenger send attempt
- [ ] All existing tests pass
- [ ] `yarn typecheck` and `yarn linter` pass

## References

- **JIRA Epic**: N/A
- **Weekly Plan Brief**: N/A
- **Related Plans**: [local-chat-infra](../local-chat-infra/overview.md), [local-chat-ui](../local-chat-ui/overview.md)
- **Rock Alignment**: N/A
