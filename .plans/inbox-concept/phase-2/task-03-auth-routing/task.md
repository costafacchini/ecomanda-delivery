# Task: Auth middleware + IngestMessengerMessage/Chat inbox threading

**Plan**: inbox-concept
**Phase**: 2
**Task ID (phase-local)**: task-03
**Task Path**: phase-2/task-03-auth-routing
**Spec References**: Story 3 (P1) — FR-004, FR-005, FR-006, FR-009
**Depends On**: phase-1/task-01-inbox-model-api, phase-1/task-02-schema-migrations
**JIRA**: N/A

## Objective

Update the webhook auth middleware to parse `?inbox=<inboxToken>` and attach `req.inbox`. Implement the "first active inbox" fallback when the param is absent. Thread `inboxId` through `IngestMessengerMessage` and `IngestChatMessage` to the `Body` record. Update `MessengersController` and `ChatsController` to pass `inboxId`.

## Context

The auth middleware lives in `src/app/routes/api-routes.ts` — specifically the `buildAuthenticateLicensee` function. It currently:
1. Parses `req.query.token` → validates `licensee.apiToken`
2. If `req.query.department` → validates `departmentToken` against licensee, attaches `req.department`
3. Calls `next()`

This task adds a third step: if `req.query.inbox` → validate `inboxToken` against licensee, attach `req.inbox`. And a fallback: if neither `inbox` nor `department` param → find first active inbox for the licensee (by `kind` matching the endpoint type) and attach it.

Key references:
- `src/app/routes/api-routes.ts` — middleware function to extend
- `src/app/routes/api-routes.spec.ts` — test file to extend
- `src/app/usecases/webhooks/IngestMessengerMessage.ts` — add `inboxId` param
- `src/app/usecases/webhooks/IngestMessengerMessage.spec.ts` — update tests
- `src/app/controllers/MessengersController.ts` — pass `inboxId: req.inbox?._id`
- `src/app/controllers/ChatsController.ts` — pass `inboxId: req.inbox?._id`
- `src/app/repositories/inbox.ts` — for fallback query in middleware

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify phase-1/task-01 status.md shows `complete`
- [ ] Verify phase-1/task-02 status.md shows `complete`
- [ ] Read `src/app/routes/api-routes.ts` — understand full middleware chain
- [ ] Read `src/app/usecases/webhooks/IngestMessengerMessage.ts`
- [ ] Read `src/app/controllers/MessengersController.ts`
- [ ] Mark task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/routes/api-routes.ts` | modify | Add inbox param parsing + fallback logic |
| `src/app/routes/api-routes.spec.ts` | modify | Add tests for inbox routing scenarios |
| `src/app/usecases/webhooks/IngestMessengerMessage.ts` | modify | Accept + store `inboxId` on Body record |
| `src/app/usecases/webhooks/IngestMessengerMessage.spec.ts` | modify | Update tests |
| `src/app/usecases/webhooks/IngestChatMessage.ts` | modify | Accept + store `inboxId` on Body record |
| `src/app/usecases/webhooks/IngestChatMessage.spec.ts` | modify | Update tests |
| `src/app/controllers/MessengersController.ts` | modify | Pass `inboxId: req.inbox?._id ?? null` |
| `src/app/controllers/MessengersController.spec.ts` | modify | Update tests |
| `src/app/controllers/ChatsController.ts` | modify | Pass `inboxId: req.inbox?._id ?? null` |
| `src/app/controllers/ChatsController.spec.ts` | modify | Update tests |

### Do NOT Modify

- `src/app/models/Inbox.ts` — owned by phase-1/task-01
- `src/app/plugins/messengers/factory.ts` — owned by phase-2/task-04-plugin-factory
- `src/app/services/BaileysSocketManager.ts` — owned by phase-2/task-04-plugin-factory

## Implementation Steps

### Step 1: Auth middleware — inbox param parsing (`api-routes.ts`)

In `buildAuthenticateLicensee`, after the existing department resolution block, add:

```typescript
// New: resolve ?inbox=<inboxToken>
if (req.query.inbox) {
  const inbox = await inboxRepository.findFirst({
    inboxToken: req.query.inbox,
    licensee: licensee._id,
    active: true,
  })
  if (!inbox) return res.sendStatus(401)
  req.inbox = inbox
}
```

### Step 2: Auth middleware — fallback logic

When neither `?inbox` nor `?department` is present, resolve the first active inbox for the licensee that matches the endpoint type (messenger or chat). The endpoint type can be inferred from the route path (`req.path.includes('/messenger/')` → kind='messenger', `/chat/` → kind='chat').

```typescript
if (!req.inbox && !req.department) {
  const kind = req.path.includes('/messenger/') ? 'messenger' : 'chat'
  const firstInbox = await inboxRepository.findFirst({
    licensee: licensee._id,
    kind,
    active: true,
  })
  if (firstInbox) req.inbox = firstInbox
  // If still no inbox, proceed — plugin factory falls back to licensee config
}
```

### Step 3: `?department=` backward compat

The existing `?department=` code path stays. Optionally, after resolving `req.department`, also try to resolve the department's linked inbox:
```typescript
if (req.department?.inbox) {
  req.inbox = await inboxRepository.findFirst({ _id: req.department.inbox })
}
```
This allows department-routing to also benefit from inbox-aware plugin factories.

### Step 4: IngestMessengerMessage

Add `inboxId` parameter:
```typescript
async execute({ body, licenseeId, departmentId = null, inboxId = null }) {
  const bodySaved = await messengerRepository.create({
    content: body,
    licensee: licenseeId,
    department: departmentId,
    inbox: inboxId,       // ← new
    kind: 'normal'
  })
  // rest unchanged
}
```

### Step 5: IngestChatMessage — same pattern as step 4

### Step 6: Controllers

In `MessengersController`:
```typescript
await ingestMessengerMessage.execute({
  body: req.body,
  licenseeId: req.licensee._id,
  departmentId: req.department?._id ?? null,
  inboxId: req.inbox?._id ?? null,   // ← new
})
```

Same for `ChatsController`.

## Testing

**Spec scenarios covered**:
- [ ] Story 3 / Scenario 1 — `?inbox=abc` resolves `req.inbox`, IngestMessengerMessage receives `inboxId` → `src/app/routes/api-routes.spec.ts`
- [ ] Story 3 / Scenario 2 — No inbox param → first active messenger inbox used as fallback → `src/app/routes/api-routes.spec.ts`
- [ ] Story 3 / Scenario 3 — `?department=<token>` still resolves correctly → `src/app/routes/api-routes.spec.ts`
- [ ] Story 3 / Scenario 4 — Invalid inbox token → 401 → `src/app/routes/api-routes.spec.ts`

**Additional verification**:
- [ ] `IngestMessengerMessage` stores `inbox` on the Body record
- [ ] `IngestChatMessage` stores `inbox` on the Body record
- [ ] When licensee has no inboxes at all, middleware still proceeds (no inbox attached) — factory falls back to licensee config
- [ ] All existing tests still pass: `npx jest`
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No new KB doc needed — extend existing `project-overview.md` webhook auth section if significantly changed
- [ ] Run `check-kb-index` after any KB changes

## Completion Criteria

- [ ] Auth middleware correctly resolves `?inbox=`, fallback, and backward compat
- [ ] `IngestMessengerMessage` and `IngestChatMessage` thread `inboxId`
- [ ] Controllers pass `inboxId`
- [ ] All spec scenarios for Story 3 pass
- [ ] `npx jest` green
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

- task-04 modifies plugin factories and Baileys. This task does NOT touch those files.
- Both tasks in Phase 2 are independent — no shared file ownership.
