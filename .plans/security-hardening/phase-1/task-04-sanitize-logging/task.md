# Task: Sanitize ChatbotsController Logging

**Plan**: Security Hardening
**Phase**: 1
**Task ID (phase-local)**: task-04
**Task Path**: phase-1/task-04-sanitize-logging
**Depends On**: None
**JIRA**: N/A

## Objective

Remove verbatim `req.body` logging from `ChatbotsController` to prevent PII and sensitive data from appearing in server logs.

## Context

`src/app/controllers/ChatbotsController.js` has two `console.info` calls that serialize the full request body:

- Line 13: `console.info(`Mensagem chegando do plugin de chatbot: ${JSON.stringify(req.body)}`)`
- Line 22: `console.info(`Transferencia solicitada: ${JSON.stringify(req.body)}`)`

These payloads may contain customer names, phone numbers, and other PII. The log statements provide operational value (tracing inbound webhooks) but should not expose body content.

Fix: log a summary (e.g., licensee ID) rather than the full body.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/controllers/ChatbotsController.js` | modify | Replace verbatim body logs with sanitized summaries |

### Do NOT Modify

- `src/config/http.js` — owned by task-01
- `src/app/routes/login-route.js` — owned by task-02
- `src/config/routes.js` — owned by task-03

## Implementation Steps

### Step 1: Replace body-logging statements

In `src/app/controllers/ChatbotsController.js`:

```js
// message() — line 13
console.info(`Mensagem chegando do plugin de chatbot: licensee=${req.licensee._id}`)

// transfer() — line 22
console.info(`Transferencia solicitada: licensee=${req.licensee._id}`)
```

The `reset()` method at line 31 (`'Agendando para resetar chatbots abandonados'`) does not log any PII — leave it unchanged.

## Testing

- [ ] `npx jest` — all existing tests pass (ChatbotsController tests, if any)
- [ ] Grep for `JSON.stringify(req.body)` in the file to confirm no remaining occurrences: `grep -n "JSON.stringify(req.body)" src/app/controllers/ChatbotsController.js` should return empty
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB doc required

## Completion Criteria

- [ ] No `req.body` serialization in `ChatbotsController` logs
- [ ] Log messages still provide operational context (licensee ID)
- [ ] All tests pass
- [ ] Changes committed to `plan/security-hardening/phase-1/task-04-sanitize-logging`
- [ ] `status.md` updated to `complete`
