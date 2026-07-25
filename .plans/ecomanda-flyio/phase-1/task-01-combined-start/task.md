# Task: Add Combined Start Script

**Plan**: Ecomanda Fly.io Deploy
**Phase**: 1
**Task ID**: task-01
**Task Path**: phase-1/task-01-combined-start
**Spec References**: Story 2 (P2), FR-001, FR-002, FR-003
**Depends On**: None
**JIRA**: N/A

## Objective

Add a `start-combined.sh` shell script and a `build:fly` npm script to ecomanda-delivery so that a single container can run both the HTTP server and the BullMQ worker without persisting a Baileys socket.

## Context

Ecomanda currently has two separate entry points: `server.ts` (Express + Socket.io) and `worker.ts` (BullMQ). The `start` npm script in `package.json` only launches the server. For Fly.io single-VM deployment, both must run in the same container.

The `build` npm script builds TypeScript + React client + widget. The React client and widget are not needed — ticketmaker only calls the REST API. Skipping them dramatically reduces build time and image size.

Key finding from `server.ts`: Baileys is only booted when `ENABLE_BAILEYS_SOCKET=true`. With it set to `false`, no persistent socket is opened — the worker opens one on-demand per send job and closes it immediately after (confirmed in `src/app/plugins/messengers/Baileys.ts:sendMessage`).

**Repo**: `/Users/alan/Developer/pessoal/ecomanda-delivery`

## Before You Start

- [ ] `cd /Users/alan/Developer/pessoal/ecomanda-delivery && git switch main && git pull`
- [ ] Confirm `server.ts` still checks `ENABLE_BAILEYS_SOCKET === 'true'` before calling `bootBaileysSocketSessions()`
- [ ] Confirm `worker.ts` starts BullMQ workers (not dependent on the socket flag)
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `start-combined.sh` | create | Shell script that forks worker, runs server foreground |
| `package.json` | modify | Add `build:fly` and `start:fly` scripts |

### Do NOT Modify

- `fly.toml` — owned by task-02
- `Dockerfile` — owned by task-02
- `server.ts`, `worker.ts` — read-only; no code changes needed

## Implementation Steps

### Step 1: Create `start-combined.sh`

Create `/Users/alan/Developer/pessoal/ecomanda-delivery/start-combined.sh`:

```bash
#!/bin/sh
set -e

# Start BullMQ worker in the background
node --require source-map-support/register dist/worker.js &
WORKER_PID=$!

# Start Express server in the foreground
node --require source-map-support/register dist/server.js &
SERVER_PID=$!

# Wait for either process to exit; if one dies, kill the other and exit
wait -n $WORKER_PID $SERVER_PID
EXIT_CODE=$?

kill $WORKER_PID $SERVER_PID 2>/dev/null || true
exit $EXIT_CODE
```

Make it executable: `chmod +x start-combined.sh`

### Step 2: Add `build:fly` and `start:fly` to `package.json`

In the `"scripts"` section of `package.json`, add:

```json
"build:fly": "tsc && echo '{\"type\":\"commonjs\"}' > dist/package.json && cp appsignal.cjs dist/appsignal.cjs",
"start:fly": "sh start-combined.sh"
```

`build:fly` omits the `cd client && yarn build` and `cd widget && yarn build` steps from the full `build` script — these are not needed for the API-only deployment.

### Step 3: Verify locally (optional sanity check)

```bash
npm run build:fly
# Confirm dist/server.js and dist/worker.js exist
ls dist/server.js dist/worker.js
```

## Testing

**Spec scenarios covered**:
- [ ] Scenario 2.1 — Combined start boots both processes: verify both PIDs appear after `sh start-combined.sh` (manual, done in task-03)
- [ ] Scenario 2.3 — Client/widget build skipped: `npm run build:fly` completes without touching `client/` or `widget/`

**Additional verification**:
- [ ] `npm run build:fly` exits 0
- [ ] `dist/server.js` and `dist/worker.js` both exist after build
- [ ] `start-combined.sh` is executable (`ls -la start-combined.sh`)

## Documentation / KB Updates

No KB/doc updates required — operational change to ecomanda, not a ticketmaker pattern.

## Completion Criteria

- [ ] `start-combined.sh` exists and is executable
- [ ] `package.json` has `build:fly` and `start:fly` scripts
- [ ] `npm run build:fly` succeeds (TypeScript compiles, no client/widget build)
- [ ] Changes committed on `plan/ecomanda-flyio/phase-1/task-01-combined-start` branch in ecomanda-delivery repo
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

- task-02 will read `package.json` to reference the `build:fly` script in the Dockerfile — complete this task first or coordinate the script names.
- task-02 owns `Dockerfile` and `fly.toml` — do not create or modify those files here.
