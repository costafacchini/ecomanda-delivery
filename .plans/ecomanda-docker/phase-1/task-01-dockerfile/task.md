# Task: Create Production Dockerfile

**Plan**: Ecomanda Docker Containerization
**Phase**: 1
**Task ID**: task-01
**Task Path**: phase-1/task-01-dockerfile
**Spec References**: Story 2 (P2), FR-001, FR-009, SC-002
**Depends On**: None
**JIRA**: N/A

## Objective

Create a production `Dockerfile` at the ecomanda-delivery repo root that builds only the TypeScript backend (skipping React client and widget), and runs both server and worker via `start-combined.sh`.

## Context

Currently ecomanda has no `Dockerfile` at the repo root — only `Dockerfile.smoke` (used for smoke tests). The `Dockerfile.smoke` is a useful reference: it uses `node:24`, installs with yarn, copies source, and compiles TypeScript.

The production image must:
- Compile TypeScript only (`tsc`) — skip `client/` and `widget/` yarn builds
- Use `start-combined.sh` as the CMD (starts server + worker in same container)
- Keep image size reasonable (< 800 MB target)

**Dependency on ecomanda-flyio plan**: `start-combined.sh` and `start:fly`/`build:fly` npm scripts are created by `ecomanda-flyio/phase-1/task-01`. Check if that task is complete before starting. If not, create `start-combined.sh` here and note the adaptation in `status.md`.

**Repo**: `/Users/alan/Developer/pessoal/ecomanda-delivery`

## Before You Start

- [ ] `cd /Users/alan/Developer/pessoal/ecomanda-delivery && git switch main && git pull`
- [ ] Check if `start-combined.sh` exists. If not, create it (see ecomanda-flyio/task-01 for the script content)
- [ ] Check if `build:fly` and `start:fly` exist in `package.json`. If not, add them (see ecomanda-flyio/task-01)
- [ ] Read `Dockerfile.smoke` for reference patterns
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `Dockerfile` | create | Production image, TS backend only |
| `start-combined.sh` | create (if not exists) | Adapted from ecomanda-flyio/task-01 |
| `package.json` | modify (if not done) | Add `build:fly` and `start:fly` if absent |
| `.dockerignore` | modify | Add widget/client build artefacts |

### Do NOT Modify

- `docker-compose.yml` — owned by task-04
- `src/app/plugins/storage/Local.ts` — owned by task-02
- `src/app/plugins/messengers/Base.ts` — owned by task-03

## Implementation Steps

### Step 1: Create `start-combined.sh` (if not already present)

```bash
#!/bin/sh
set -e

node --require source-map-support/register dist/worker.js &
WORKER_PID=$!

node --require source-map-support/register dist/server.js &
SERVER_PID=$!

wait -n $WORKER_PID $SERVER_PID
EXIT_CODE=$?

kill $WORKER_PID $SERVER_PID 2>/dev/null || true
exit $EXIT_CODE
```

```bash
chmod +x start-combined.sh
```

### Step 2: Add npm scripts (if not already present)

In `package.json` `"scripts"`:

```json
"build:fly": "tsc && echo '{\"type\":\"commonjs\"}' > dist/package.json && cp appsignal.cjs dist/appsignal.cjs",
"start:fly": "sh start-combined.sh"
```

### Step 3: Create `Dockerfile`

```dockerfile
FROM node:24-slim AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

FROM node:24-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build:fly

FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/appsignal.cjs ./appsignal.cjs
COPY --from=builder /app/start-combined.sh ./start-combined.sh
RUN chmod +x start-combined.sh

EXPOSE 5000
CMD ["sh", "start-combined.sh"]
```

> Multi-stage build keeps the final image lean by excluding dev tooling and source files.

### Step 4: Update `.dockerignore`

Ensure these are excluded:

```
node_modules
client/node_modules
widget/node_modules
client/dist
widget/dist
dist
.git
.env
coverage
```

### Step 5: Verify image builds

```bash
docker build -t ecomanda-local .
docker images ecomanda-local
# Confirm size < 800 MB
```

## Testing

**Spec scenarios covered**:
- [ ] Scenario 2.1 — Image builds without client/widget: `docker build .` succeeds; `client/` and `widget/` dirs not present in final image
  - Verify: `docker run --rm ecomanda-local ls /app` — should not contain `client` or `widget` directories

**Additional verification**:
- [ ] Image builds without errors: `docker build -t ecomanda-local . && echo "BUILD OK"`
- [ ] `docker images ecomanda-local` shows size < 800 MB
- [ ] `docker run --rm ecomanda-local ls dist/server.js dist/worker.js` — both files exist

## Documentation / KB Updates

No KB/doc updates required — operational Dockerfile, not a reusable ticketmaker pattern.

## Completion Criteria

- [ ] `Dockerfile` exists at repo root with multi-stage build
- [ ] `start-combined.sh` exists and is executable
- [ ] `build:fly` and `start:fly` in `package.json`
- [ ] `docker build .` produces an image < 800 MB without client/widget
- [ ] Changes committed on `plan/ecomanda-docker/phase-1/task-01-dockerfile` branch
- [ ] Status updated in `status.md`
