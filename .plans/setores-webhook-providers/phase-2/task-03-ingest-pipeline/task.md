# Task: Ingest pipeline — thread setorId from controller to Message

**Plan**: Setores — Webhook Providers
**Phase**: 2
**Task ID (phase-local)**: task-03
**Task Path**: phase-2/task-03-ingest-pipeline
**Depends On**: phase-1/task-01-setor-token
**JIRA**: N/A

## Objective

Thread `setorId` through the inbound message pipeline: `MessengersController` reads `req.setor?._id` and passes it to `IngestMessengerMessage`, which persists it on the `Body` document. `transformMessengerBody` then reads `body.setor` and stamps it onto each created `Message`. From that point the existing pipeline (job worker → `LocalChat.sendMessage()` → `Room.create()`) already propagates `setor` — no further changes are needed beyond this task.

## Context

The full propagation chain this task enables:

```
req.setor._id (set by task-02 auth middleware)
  → MessengersController.message() passes setorId
    → IngestMessengerMessage.execute({ body, licenseeId, setorId })
      → Body.create({ content, licensee, kind, setor: setorId })  ← persisted here
        → job queue: { bodyId, licenseeId }
          → transformMessengerBody() reads body.setor
            → Message.create({ ..., setor: body.setor })
              → (existing) LocalChat.sendMessage() reads message.setor
                → Room.create({ contact, status: 'pending', setor: message.setor })
```

`Body.setor` and `Message.setor` fields already exist — they were added by the `setores` plan (task-02). This task only wires up the data flow; no schema changes are needed.

`transformMessengerBody` currently calls `messengerPlugin.responseToMessages(body.content)` which returns `Message` objects already saved to the DB. The `setor` must be set on each message **after** `responseToMessages` returns, using `message.setor = body.setor` + `messageRepository.save(message)`, OR by passing `setorId` into `responseToMessages` if the base class supports it. Read the actual implementation before choosing — do not assume the interface.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Create task branch: `git switch -c plan/setores-webhook-providers/phase-2/task-03-ingest-pipeline`
- [ ] Verify phase-1/task-01-setor-token is complete
- [ ] Read `src/app/controllers/MessengersController.ts` (full file)
- [ ] Read `src/app/usecases/webhooks/IngestMessengerMessage.ts` (full file)
- [ ] Read `src/app/services/MessengerMessage.ts` (full file)
- [ ] Read `src/app/plugins/messengers/Base.ts` — understand how `responseToMessages` creates Messages
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/controllers/MessengersController.ts` | modify | Read `req.setor?._id`, forward as `setorId` |
| `src/app/controllers/MessengersController.spec.ts` | modify | Add sector forwarding tests |
| `src/app/usecases/webhooks/IngestMessengerMessage.ts` | modify | Accept `setorId`, persist on Body |
| `src/app/usecases/webhooks/IngestMessengerMessage.spec.ts` | modify | Add setorId tests |
| `src/app/services/MessengerMessage.ts` | modify | Read `body.setor`, stamp onto Messages |
| `src/app/services/MessengerMessage.spec.ts` | modify | Add setor propagation test |

### Do NOT Modify

- `src/app/routes/api-routes.ts` — owned by phase-2/task-02-auth-middleware
- `src/app/models/Body.ts` — schema already updated by `setores` plan task-02; do not re-edit
- `src/app/models/Message.ts` — schema already updated by `setores` plan task-02; do not re-edit
- `src/app/plugins/chats/LocalChat.ts` — owned by `setores` plan phase-2/task-04; already handles `message.setor`

## Implementation Steps

### Step 1: Update `MessengersController.ts`

```ts
async message(req: any, res: any) {
  await this.ingestMessengerMessage.execute({
    body: req.body,
    licenseeId: req.licensee._id,
    setorId: req.setor?._id ?? null,
  })

  res.status(200).send({ body: 'Solicitação de mensagem para a plataforma de messenger agendado' })
}
```

### Step 2: Update `IngestMessengerMessage.ts`

```ts
async execute({ body, licenseeId, setorId }: Record<string, any> = {}) {
  const bodySaved = await this.messengerRepository.create({
    content: body,
    licensee: licenseeId,
    kind: MESSENGER_MESSAGE_KIND,
    setor: setorId ?? null,
  })

  await this.jobQueue.addJob(MESSENGER_MESSAGE_JOB, {
    bodyId: bodySaved._id,
    licenseeId,
  })

  return bodySaved
}
```

### Step 3: Update `transformMessengerBody` in `MessengerMessage.ts`

After `messengerPlugin.responseToMessages(body.content)` returns the list of created messages, stamp `body.setor` onto each message. Read the actual implementation to understand how messages are returned and saved — the approach (update each message's `setor` field in the returned objects, or use a repository save) depends on whether messages are already persisted at this point.

The goal: every `Message` document created from a sector-scoped `Body` must have `setor` set to `body.setor`.

## Testing

- [ ] `MessengersController.message`: when `req.setor` is set, `ingestMessengerMessage.execute` is called with `setorId` equal to `req.setor._id`
- [ ] `MessengersController.message`: when `req.setor` is absent, `ingestMessengerMessage.execute` is called with `setorId: null`
- [ ] `IngestMessengerMessage.execute`: Body saved with `setor` when `setorId` provided
- [ ] `IngestMessengerMessage.execute`: Body saved with `setor: null` when `setorId` is absent
- [ ] `transformMessengerBody`: each returned Message has `setor` matching `body.setor`
- [ ] `transformMessengerBody`: when `body.setor` is null, Messages have `setor: null`
- [ ] All existing tests in the three spec files still pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB doc updates required at this task — the full feature is documented in the plan overview

## Completion Criteria

- [ ] `MessengersController` forwards `setorId` from `req.setor?._id`
- [ ] `IngestMessengerMessage` persists `setorId` on `Body`
- [ ] `transformMessengerBody` stamps `body.setor` onto each created `Message`
- [ ] All tests pass: `npx jest src/app/controllers/MessengersController.spec.ts src/app/usecases/webhooks/IngestMessengerMessage.spec.ts src/app/services/MessengerMessage.spec.ts`
- [ ] `npx eslint src/app/controllers/MessengersController.ts src/app/usecases/webhooks/IngestMessengerMessage.ts src/app/services/MessengerMessage.ts` passes
- [ ] Changes committed to `plan/setores-webhook-providers/phase-2/task-03-ingest-pipeline` branch
- [ ] Status updated to `complete` in `status.md`

## Conflict Avoidance Notes

task-02 (auth-middleware) owns `api-routes.ts` only. No file overlap with this task. Both can run in parallel once phase-1 is merged.
