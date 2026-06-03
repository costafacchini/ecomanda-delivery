# Plan: Local Chat Infrastructure

**Status**: not-started
**Created**: 2026-05-29
**Last Updated**: 2026-05-29
**Estimated Demo Date**: TBD
**Assigned Dev**: Alan Costa Facchini
**Assigned QA**: unassigned

## Objective

Replace the boolean `isAdmin`/`isSuper` flags on User with a proper `role` enum, build a LocalChat plugin that routes messages to internal agents instead of external platforms, and implement the super-user licensee selection flow on the frontend.

## Scope

### In Scope
- `User.role` field (`agent | supervisor | admin | super`) replacing `isAdmin`/`isSuper`
- One-shot migration script: `costafacchini@gmail.com` → `super`, others with `isAdmin: true` → `admin`
- `authorize(...roles)` middleware in `resources-routes.ts` replacing the existing `requireSuper`
- `Room` model: add `agent` (ref: User) and `status` (`pending | open | closed`) alongside existing `closed` boolean
- `LocalChat` plugin — `sendMessage()` creates/finds Room, emits Socket.IO event to agents; `parseMessage()` parses agent reply body
- `socketEmitter` singleton so LocalChat can emit events without circular imports
- Agent reply endpoint: `POST /v1/chat/rooms/:roomId/messages`
- `Licensee.chatDefault` enum extended with `'local'`
- `AppContext` — add `activeLicensee` + `setActiveLicensee` persisted in localStorage
- Post-login modal for super: must select a licensee before accessing anything
- `SelectLicenseeModal` component wrapping existing `SelectLicenseesWithFilter`
- User menu in Navbar (replace "Sair" button with dropdown): default avatar, "Sair", "Trocar de licenciado" for super
- Server-side message access fix: non-super users cannot query other licensees' messages
- Route authorization audit: replace `requireSuper` with role-based guards across all routes

### Out of Scope
- Agent inbox UI (agents viewing and responding to conversations) — deferred; agents interact via API only in this plan
- Room assignment logic beyond creation and status management
- Supervisor-specific UI (configuration access) — roles enforced but dedicated UI deferred
- Avatar upload — default icon only, upload deferred

## Kill Criteria

- If migrating `isAdmin`/`isSuper` to `role` breaks authentication for existing users in production, roll back and investigate before continuing
- If the LocalChat Socket.IO event shape conflicts with existing Socket.IO usage, stop and redesign the event contract

## Prerequisites

None — this plan has no dependency on other plans. It is a prerequisite for `setores`.

## Phases

| Phase | Name | Tasks | Dependencies | Description |
|-------|------|-------|--------------|-------------|
| 1 | Data & Auth Infrastructure | task-01, task-02 | None | User role field + authorize middleware; Room model — parallel, no shared files |
| 2 | Plugin & Frontend | task-03, task-04 | Phase 1 | LocalChat plugin + agent reply API; super flow + user menu — parallel |
| 3 | Authorization Rollout | task-05 | Phase 2 | Apply role guards to all routes; fix server-side filtering gaps |

## Task Summary

| Task Path | Title | Phase | Status | Depends On |
|-----------|-------|-------|--------|------------|
| phase-1/task-01-user-role-system | User role system + authorize middleware | 1 | not-started | — |
| phase-1/task-02-room-model | Room model: agent + status fields | 1 | not-started | — |
| phase-2/task-03-local-chat-plugin | LocalChat plugin + agent reply API | 2 | not-started | phase-1/task-01-user-role-system, phase-1/task-02-room-model |
| phase-2/task-04-frontend-super-flow | Frontend: super licensee flow + user menu | 2 | not-started | phase-1/task-01-user-role-system |
| phase-3/task-05-route-authorization | Route authorization rollout | 3 | not-started | phase-2/task-03-local-chat-plugin, phase-2/task-04-frontend-super-flow |

## Branch Convention

Pattern: `plan/local-chat-infra/{task-path}`

Base branch: `main`

## Key Files

| File/Directory | Relevance |
|----------------|-----------|
| `src/app/models/User.ts` | Add `role` field, deprecate `isAdmin`/`isSuper` |
| `src/app/routes/resources-routes.ts` | `authorize()` middleware; route guards |
| `scripts/migrate-user-roles.js` | NEW — one-shot DB migration (run manually) |
| `src/app/models/Room.ts` | Add `agent` + `status` fields |
| `src/app/plugins/chats/LocalChat.ts` | NEW — local chat plugin |
| `src/app/plugins/chats/factory.ts` | Add `'local'` case |
| `src/app/services/socketEmitter.ts` | NEW — Socket.IO singleton for plugins |
| `src/config/http.ts` | Wire `socketEmitter` after `io` creation |
| `src/app/models/Licensee.ts` | Add `'local'` to `chatDefault` enum |
| `client/src/contexts/App/index.tsx` | Add `activeLicensee` state |
| `client/src/components/SelectLicenseeModal/index.tsx` | NEW — licensee picker modal |
| `client/src/pages/Navbar/index.tsx` | Replace "Sair" with user menu dropdown |
| `client/src/pages/SignIn/index.tsx` | Trigger modal if super after login |

## Risks

- **Auth regression** — changing `isAdmin`/`isSuper` to `role` affects both server-side guards and client-side conditionals. Mitigation: keep `isAdmin`/`isSuper` in the schema during migration (as deprecated aliases), remove only in a follow-up task after verifying role-based guards work end-to-end.
- **Socket.IO circular import** — importing `io` directly in plugins would create a circular dependency. Mitigation: `socketEmitter.ts` singleton breaks the cycle.
- **Super user locked out** — if the post-login modal is shown but the user has no licensees to select (empty DB), they cannot proceed. Mitigation: modal should allow dismissal for super users without any licensees; show a clear message.

## Success Criteria

- [ ] `POST /login` response for `costafacchini@gmail.com` returns user with `role: 'super'`
- [ ] Former admin users return `role: 'admin'`; new users default to `role: 'agent'`
- [ ] `authorize('super')` correctly blocks non-super users with 403
- [ ] `authorize('admin', 'super')` blocks `agent` and `supervisor` with 403
- [ ] Licensee with `chatDefault: 'local'` routes messages to LocalChat plugin
- [ ] `sendMessage()` emits Socket.IO event when a message arrives for an agent
- [ ] Agent reply `POST /v1/chat/rooms/:roomId/messages` creates a `Message` with `destination: 'to-messenger'`
- [ ] Super user sees licensee selection modal after login
- [ ] Super user can switch licensee via "Trocar de licenciado" menu item
- [ ] Non-super user querying another licensee's messages receives 403
- [ ] All unit tests pass: `npx jest`
- [ ] `npx eslint .` produces no new errors

## References

- **JIRA Epic**: N/A
- **Related Plans**: [Setores](../setores/overview.md) — depends on this plan
- **Rock Alignment**: N/A
