# Task: Create Fly.io Configuration

**Plan**: Ecomanda Fly.io Deploy
**Phase**: 1
**Task ID**: task-02
**Task Path**: phase-1/task-02-flyio-config
**Spec References**: Story 2 (P2), FR-004, FR-005
**Depends On**: None (coordinate script names with task-01)
**JIRA**: N/A

## Objective

Create `fly.toml` and update `Dockerfile` in the ecomanda-delivery repo so the app can be launched on Fly.io as a single 1 GB shared-cpu VM with no volumes.

## Context

ecomanda-delivery has an existing `Dockerfile` (used for Heroku) and no `fly.toml`. Heroku uses `Procfile`-style web/worker dynos; Fly.io uses a single `CMD` in the container.

The Dockerfile's `CMD` must be changed to call `start:fly` (defined in task-01). The image build uses `build:fly` (also from task-01) to skip the React client and widget.

MongoDB Atlas and Redis are external services — no Fly.io volumes or managed databases.

**Repo**: `/Users/alan/Developer/pessoal/ecomanda-delivery`

## Before You Start

- [ ] `cd /Users/alan/Developer/pessoal/ecomanda-delivery && git switch main && git pull`
- [ ] Confirm task-01 is complete (or at minimum that `build:fly` and `start:fly` script names are agreed upon)
- [ ] Read the existing `Dockerfile` to understand the current build stages
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `Dockerfile` | modify | Change build script to `build:fly`; change CMD to `start:fly` |
| `fly.toml` | create | App config: 1 GB RAM, shared-cpu-1x, port 5000, health check |
| `.dockerignore` | modify (if exists) | Ensure `client/node_modules` and `widget/node_modules` are ignored |

### Do NOT Modify

- `start-combined.sh` — owned by task-01
- `package.json` — owned by task-01

## Implementation Steps

### Step 1: Read the existing Dockerfile

```bash
cat /Users/alan/Developer/pessoal/ecomanda-delivery/Dockerfile
```

Identify the `RUN npm run build` (or equivalent) and `CMD` lines. These are the two lines to change.

### Step 2: Update `Dockerfile`

Replace the build command with `build:fly` and the start command with `start:fly`. Typical changes:

```dockerfile
# Before:
RUN npm run build
CMD ["npm", "run", "start"]

# After:
RUN npm run build:fly
CMD ["npm", "run", "start:fly"]
```

If there is a multi-stage build, apply the change to the appropriate stage.

### Step 3: Create `fly.toml`

Create `/Users/alan/Developer/pessoal/ecomanda-delivery/fly.toml`:

```toml
app = 'ecomanda-delivery'
primary_region = 'gru'

[build]

[env]
  NODE_ENV = 'production'
  PORT = '5000'
  ENABLE_BAILEYS_SOCKET = 'false'

[http_service]
  internal_port = 5000
  force_https = true
  auto_stop_machines = 'stop'
  auto_start_machines = true
  min_machines_running = 1
  processes = ['app']

  [[http_service.checks]]
    interval = '30s'
    timeout = '10s'
    grace_period = '2m'
    method = 'GET'
    path = '/login'

[[vm]]
  memory = '1gb'
  cpu_kind = 'shared'
  cpus = 1
```

> **Health check**: ecomanda has no `/health` endpoint. Use `GET /login` which returns the login page (HTTP 200) as a proxy for liveness. Verify this is the case before deploying.

### Step 4: Update `.dockerignore` (if present)

Ensure these are ignored to keep image lean:

```
client/node_modules
widget/node_modules
client/dist
widget/dist
node_modules
.env
.git
```

## Testing

**Spec scenarios covered**:
- [ ] Scenario 2.3 — Client/widget skipped: `docker build -f Dockerfile .` (or `fly deploy --build-only`) completes without building client/widget

**Additional verification**:
- [ ] `fly config validate` passes (run after task-03 sets up the app)
- [ ] `fly.toml` has `memory = '1gb'` and `min_machines_running = 1`

## Documentation / KB Updates

No KB/doc updates required.

## Completion Criteria

- [ ] `fly.toml` exists with correct VM size and health check
- [ ] `Dockerfile` uses `build:fly` and `start:fly`
- [ ] Changes committed on `plan/ecomanda-flyio/phase-1/task-02-flyio-config` branch in ecomanda-delivery
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

- task-01 owns `package.json` and `start-combined.sh`. This task only references their output — do not modify those files.
- task-03 will run `fly deploy`, which consumes the `fly.toml` created here.
