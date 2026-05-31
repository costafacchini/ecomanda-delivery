# Task: Chat Plugin & Helper Types

**Plan**: Backend Type Narrowing
**Phase**: 3
**Task ID (phase-local)**: task-11
**Task Path**: phase-3/task-11-chat-plugins-helpers
**Depends On**: phase-2/task-04-core-repositories
**JIRA**: N/A

## Objective

Type the chat plugin classes (Chatwoot, Crisp) and backend helper utilities, replacing remaining `any` in method signatures and utility functions.

## Context

Chat plugins (`src/app/plugins/chats/`) integrate with external customer service platforms. They have similar `sendMessage` / `responseToMessages` patterns to messenger plugins. Helpers (`src/app/helpers/`) contain utility functions with typed inputs.

Files in scope:
- `src/app/plugins/chats/Chatwoot.ts`
- `src/app/plugins/chats/Crisp.ts`
- `src/app/plugins/chats/Base.ts` (if exists)
- `src/app/helpers/Files.ts`
- `src/app/helpers/SanitizeErrors.ts`
- `src/app/helpers/NormalizePhone.ts`
- `src/app/helpers/RequireDependency.ts`
- `src/app/helpers/logger.ts`
- `src/app/services/Backup.ts`
- `src/app/services/request.ts`

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-2/task-04-core-repositories` is `complete`
- [ ] Verify `phase-3/task-10-messenger-plugins` is `complete` — use `IMessengerPlugin` pattern as reference
- [ ] `ls src/app/plugins/chats/ src/app/helpers/` to confirm full file lists
- [ ] Check this task's `status.md` and mark `in-progress` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/plugins/chats/Base.ts` | modify | Define `IChatPlugin` interface mirroring `IMessengerPlugin` |
| `src/app/plugins/chats/Chatwoot.ts` | modify | Type webhook payload and send params |
| `src/app/plugins/chats/Crisp.ts` | modify | Type webhook payload and send params |
| `src/app/helpers/Files.ts` | modify | Type file detection function params and returns |
| `src/app/helpers/SanitizeErrors.ts` | modify | Type error list params (already uses lodash) |
| `src/app/helpers/NormalizePhone.ts` | modify | Type phone string params |
| `src/app/helpers/RequireDependency.ts` | modify | Type dependency param |
| `src/app/helpers/logger.ts` | modify | Type log method params |
| `src/app/services/request.ts` | modify | Type axios wrapper params and returns |

### Do NOT Modify

- `src/app/plugins/messengers/*` — owned by phase-3/task-10
- `src/app/controllers/*` — owned by phase-3/task-09

## Implementation Steps

### Step 1: Define `IChatPlugin` interface

Mirror the `IMessengerPlugin` pattern from task-10. Define in `Base.ts`.

### Step 2: Type Chatwoot and Crisp

Apply chat payload interfaces and concrete method signatures. Define Chatwoot/Crisp-specific payload interfaces either inline or in `src/types/chat-payloads.ts`.

### Step 3: Type helpers

For each helper file, replace `any` params with the actual types they process. Helpers are typically small — these changes should be straightforward.

### Step 4: Type service utilities

In `request.ts`, type the axios wrapper methods. In `Backup.ts`, type the internal function params.

### Step 5: Typecheck

`npx tsc --noEmit`. Fix only owned files.

## Testing

- [ ] `npx tsc --noEmit` passes
- [ ] `NODE_ENV=test npx jest --testPathPattern="plugins/chats|helpers" --no-coverage` — all pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] Run `document-solution` if the `IChatPlugin` / `IMessengerPlugin` interface pattern is worth documenting
- [ ] Run `check-kb-index` if KB files are added

## Completion Criteria

- [ ] `IChatPlugin` interface defined
- [ ] Chatwoot and Crisp methods typed
- [ ] All helper function params typed
- [ ] All chat plugin and helper tests pass
- [ ] `npx tsc --noEmit` clean
- [ ] Status updated in `status.md`
- [ ] Changes committed to `plan/type-backend/phase-3/task-11-chat-plugins-helpers`
