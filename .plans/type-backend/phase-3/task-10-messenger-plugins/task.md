# Task: Messenger Plugin Types

**Plan**: Backend Type Narrowing
**Phase**: 3
**Task ID (phase-local)**: task-10
**Task Path**: phase-3/task-10-messenger-plugins
**Depends On**: phase-2/task-04-core-repositories
**JIRA**: N/A

## Objective

Type the messenger plugin classes in `src/app/plugins/messengers/` — Baileys, Dialog, YCloud, Pabbly, Wevo — replacing `any` in method signatures, webhook payload types, and internal processing methods.

## Context

Messenger plugins receive inbound webhook payloads and convert them to `IMessage` objects, and send outbound messages given an `IMessage`. The 140 `any` occurrences here are split between payload parsing and method signatures.

Key pattern: define interfaces for each provider's webhook payload shape (e.g., `IDialogWebhookPayload`, `IYCloudWebhookPayload`) and use them as input types for `responseToMessages()`. The `sendMessage()` method takes `(messageId: string, url: string)` or similar — make the signature concrete.

Read `docs/kb/features/baileys-whatsapp-guide.md` before touching Baileys.ts.

Files:
- `src/app/plugins/messengers/Baileys.ts`
- `src/app/plugins/messengers/Dialog.ts`
- `src/app/plugins/messengers/YCloud.ts`
- `src/app/plugins/messengers/Pabbly.ts`
- `src/app/plugins/messengers/Wevo.ts` (if exists)
- `src/app/plugins/messengers/Base.ts` (if exists)

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-2/task-04-core-repositories` is `complete`
- [ ] Read `docs/kb/features/baileys-whatsapp-guide.md`
- [ ] `ls src/app/plugins/messengers/` to confirm full file list
- [ ] Check this task's `status.md` and mark `in-progress` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/plugins/messengers/Base.ts` | modify | Define `IMessengerPlugin` interface |
| `src/app/plugins/messengers/Baileys.ts` | modify | Type socket events, message handlers |
| `src/app/plugins/messengers/Dialog.ts` | modify | Type webhook payload and send params |
| `src/app/plugins/messengers/YCloud.ts` | modify | Type webhook payload and send params |
| `src/app/plugins/messengers/Pabbly.ts` | modify | Type webhook payload and send params |
| `src/app/plugins/messengers/Wevo.ts` | modify | Type webhook payload and send params |
| `src/types/messenger-payloads.ts` | create | Webhook payload interfaces per provider |
| `src/types/index.ts` | modify | Export messenger payload interfaces |

### Do NOT Modify

- `src/app/plugins/chats/*` — owned by phase-3/task-11
- `src/app/controllers/*` — owned by phase-3/task-09

## Implementation Steps

### Step 1: Define `IMessengerPlugin` base interface

In `Base.ts`, define the interface that all messengers implement: `sendMessage(messageId: string, url: string): Promise<void>`, `responseToMessages(body: unknown): Promise<IMessage[]>`. Export it.

### Step 2: Define webhook payload interfaces

Create `src/types/messenger-payloads.ts` with one interface per provider for the expected inbound webhook body shape. These can start permissive and be narrowed over time.

### Step 3: Type each plugin

For each plugin file, apply the payload interfaces to `responseToMessages()` and make `sendMessage()` concrete. Replace `any` on internal helper functions.

## Testing

- [ ] `npx tsc --noEmit` passes
- [ ] `NODE_ENV=test npx jest --testPathPattern="plugins/messengers" --no-coverage` — all pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB/doc updates required

## Completion Criteria

- [ ] `IMessengerPlugin` interface defined
- [ ] Webhook payload interfaces created per provider
- [ ] All messenger plugin methods typed
- [ ] All messenger tests pass
- [ ] Status updated in `status.md`
- [ ] Changes committed to `plan/type-backend/phase-3/task-10-messenger-plugins`
