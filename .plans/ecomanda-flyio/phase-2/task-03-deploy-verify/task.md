# Task: Deploy to Fly.io and Verify

**Plan**: Ecomanda Fly.io Deploy
**Phase**: 2
**Task ID**: task-03
**Task Path**: phase-2/task-03-deploy-verify
**Spec References**: Story 1 (P1), Story 2 (P2), FR-001–FR-005, SC-001–SC-004
**Depends On**: phase-1/task-01-combined-start, phase-1/task-02-flyio-config
**JIRA**: N/A

## Objective

Launch ecomanda on Fly.io, configure all secrets, and verify that `POST /resources/messages` successfully enqueues and delivers a WhatsApp message.

## Context

ecomanda-delivery repo now has `fly.toml`, `Dockerfile` updated for Fly.io, `start-combined.sh`, and `build:fly`/`start:fly` npm scripts. This task performs the actual `fly launch` (or `fly deploy` if the app already exists), sets secrets, and runs the smoke test.

**Required secrets** (gather values before starting):
| Secret | Where to find |
|--------|---------------|
| `MONGODB_URI` | MongoDB Atlas → Connect → Drivers |
| `REDIS_URL` | Redis provider dashboard |
| `SECRET` | Current Heroku config vars |
| `DEFAULT_USER` | Current Heroku config vars |
| `DEFAULT_PASSWORD` | Current Heroku config vars |

Optional (remove if not used in your instance):
- `ROLLBAR_ACCESS_TOKEN`
- `APPSIGNAL_PUSH_API_KEY`
- `NEW_RELIC_*`

**MongoDB Atlas Network Access**: Before deploying, ensure Atlas allows connections from all IPs (`0.0.0.0/0`) or from Fly.io's GRU region IPs. This is the most common first-deploy blocker.

**Repo**: `/Users/alan/Developer/pessoal/ecomanda-delivery`

## Before You Start

- [ ] Confirm phase-1/task-01 and phase-1/task-02 are both `complete` in their `status.md` files
- [ ] Gather all secret values listed above from Heroku: `heroku config -a <heroku-app-name>`
- [ ] Confirm MongoDB Atlas Network Access allows `0.0.0.0/0` (or Fly.io GRU IPs)
- [ ] Confirm you are authenticated: `fly auth whoami`
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

This task does not modify files in either repo. It only runs CLI commands.

### Do NOT Modify

- All ecomanda-delivery source files — phase 1 tasks own those
- ticketmaker files — owned by task-04

## Implementation Steps

### Step 1: Create the Fly.io app

```bash
cd /Users/alan/Developer/pessoal/ecomanda-delivery
fly launch --no-deploy --region gru --name ecomanda-delivery
```

If the app name is already taken, choose a different name and update `fly.toml` accordingly.

### Step 2: Set all secrets

```bash
fly secrets set \
  NODE_ENV=production \
  MONGODB_URI="<value>" \
  REDIS_URL="<value>" \
  SECRET="<value>" \
  DEFAULT_USER="<value>" \
  DEFAULT_PASSWORD="<value>" \
  ENABLE_BAILEYS_SOCKET=false
```

Add optional secrets only if the app uses them (check current Heroku config vars).

### Step 3: Deploy

```bash
fly deploy
```

Watch logs for MongoDB connection confirmation:
```bash
fly logs
```

Look for: `connected to MongoDB` (or equivalent log line from ecomanda's `src/config/database.ts`).

### Step 4: Verify health check

```bash
fly status
# Should show: 1 machine, state = running
curl -s -o /dev/null -w "%{http_code}" https://ecomanda-delivery.fly.dev/login
# Expected: 200
```

### Step 5: Verify `/resources/messages` endpoint

Get the `apiToken` for your licensee from MongoDB Atlas (or from Heroku via the existing ecomanda admin panel):

```bash
curl -X POST "https://ecomanda-delivery.fly.dev/resources/messages?token=<apiToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "licensee": "<licenseeId>",
    "phone": "<yourPhone>@c.us",
    "kind": "text",
    "text": "Smoke test from Fly.io",
    "destination": "to-messenger"
  }'
# Expected: HTTP 200/201 with a message ID
```

### Step 6: Confirm WhatsApp delivery

Wait up to 30 seconds and confirm the WhatsApp message arrives on `<yourPhone>`.

Check worker logs during delivery:
```bash
fly logs | grep -i "baileys\|mensagem\|enviada"
```

## Testing

**Spec scenarios covered**:
- [ ] Scenario 1.1 — Server connects to MongoDB: `fly logs` shows connection log, no crash
- [ ] Scenario 1.2 — POST /resources/messages returns success: curl returns 2xx + message ID
- [ ] Scenario 1.3 — Session reused, no QR re-pairing: worker sends without new QR prompt
- [ ] Scenario 1.4 — Message arrives on WhatsApp: message received within 30s
- [ ] Scenario 2.1 — Combined start boots both processes: `fly logs` shows both server and worker active
- [ ] Scenario 2.2 — ENABLE_BAILEYS_SOCKET=false: no persistent socket log on boot

**Additional verification**:
- [ ] `fly status` shows 1 machine running
- [ ] No Fly.io volume is created (`fly volumes list` returns empty)
- [ ] `fly metrics` shows memory usage < 900 MB after a send

## Documentation / KB Updates

After this task completes, record the new ecomanda URL in a note or memory so task-04 has it.
No KB/doc update in ticketmaker needed — this is infrastructure for an external service.

## Completion Criteria

- [ ] SC-001: `fly status` shows ecomanda running (1 machine)
- [ ] SC-002: `POST /resources/messages` returns 2xx
- [ ] SC-003: WhatsApp message received during smoke test
- [ ] SC-004: No volume provisioned
- [ ] Status updated in `status.md` with the deployed URL in Artifacts

## Conflict Avoidance Notes

No parallel tasks in this phase.
