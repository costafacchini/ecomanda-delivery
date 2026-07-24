# Task: Update Ticketmaker Secret and Smoke Test

**Plan**: Ecomanda Fly.io Deploy
**Phase**: 3
**Task ID**: task-04
**Task Path**: phase-3/task-04-ticketmaker-cutover
**Spec References**: Story 1 (P1), FR-006, SC-005
**Depends On**: phase-2/task-03-deploy-verify
**JIRA**: N/A

## Objective

Point ticketmaker's `ecomanda_base_url` Fly.io secret to the new ecomanda Fly.io URL and confirm messaging still works end-to-end from ticketmaker.

## Context

ticketmaker's ecomanda integration is in `app/services/messaging/providers/ecomanda.rb`. It reads `account.ecomanda_base_url` from the `accounts` table, which is seeded via the onboarding flow or directly in the DB.

However, in production on Fly.io, the URL may also be set as an env var or per-account in the DB. Check both:
1. `fly secrets list -a ticket-maker` — look for `ECOMANDA_BASE_URL` or similar
2. Query the production DB: `fly ssh console -a ticket-maker -C "bin/rails runner 'puts Account.pluck(:ecomanda_base_url).compact.uniq'"` to see what URLs are stored

The `ecomanda_base_url` is a per-account field stored in the DB, not a global env var. The update is a DB record change, not a Fly.io secret.

**Repo**: `/Users/alan/Developer/pessoal/IA/ticketmaker`
**ecomanda new URL**: obtained from task-03 Artifacts (e.g., `https://ecomanda-delivery.fly.dev`)

## Before You Start

- [ ] Confirm task-03 is `complete` and the ecomanda Fly.io URL is recorded in task-03's `status.md` Artifacts
- [ ] Confirm Heroku ecomanda is still running (keep it up until SC-005 passes)
- [ ] Run `fly ssh console -a ticket-maker -C "bin/rails runner 'puts Account.all.map { |a| [a.id, a.ecomanda_base_url] }.inspect'"` to see current URLs
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

This task does not modify source files. It performs a DB update via Rails console.

### Do NOT Modify

- `app/services/messaging/providers/ecomanda.rb` — no code change needed
- Any ticketmaker config files

## Implementation Steps

### Step 1: Update `ecomanda_base_url` in production DB

Connect to the ticketmaker production Rails console:

```bash
fly ssh console -a ticket-maker -C "bin/rails console"
```

Update the URL for all accounts that use ecomanda:

```ruby
# Preview first
Account.where.not(ecomanda_base_url: [nil, ""]).each do |a|
  puts "#{a.id}: #{a.ecomanda_base_url}"
end

# Update
Account.where.not(ecomanda_base_url: [nil, ""]).update_all(
  ecomanda_base_url: "https://ecomanda-delivery.fly.dev"
)
```

Replace `ecomanda-delivery.fly.dev` with the actual app URL from task-03.

### Step 2: Smoke test from ticketmaker

Trigger a message send from ticketmaker that goes through ecomanda. The simplest way is to use the existing `EcomandaContactSyncJob` or manually trigger a task notification:

```bash
fly ssh console -a ticket-maker -C "bin/rails runner '
  account = Account.find(<account_id>)
  Current.account = account
  user = account.users.first
  UserTasksNotificationJob.perform_now(user.id)
'"
```

Alternatively, from the ticketmaker UI: assign a task to an agent with a phone number configured — this triggers `TaskAssignmentNotificationJob`.

### Step 3: Confirm delivery

Watch ticketmaker logs for ecomanda API calls:
```bash
fly logs -a ticket-maker | grep -i "ecomanda\|delivery"
```

Confirm the WhatsApp message arrives on the target phone.

### Step 4: (Optional) Shut down Heroku ecomanda

Once SC-005 passes, the Heroku dyno can be scaled to 0 or the app deleted:

```bash
heroku ps:scale web=0 worker=0 -a <heroku-app-name>
```

Do not delete until confident everything is working.

## Testing

**Spec scenarios covered**:
- [ ] Scenario 1.2 — POST /resources/messages returns success (now via ticketmaker → Fly.io ecomanda)
- [ ] Scenario 1.4 — Message arrives on WhatsApp end-to-end from ticketmaker

**Additional verification**:
- [ ] SC-005: ticketmaker messaging tests pass — run `bundle exec rails test test/services/messaging/` (if test suite exists for messaging layer)
- [ ] `fly logs -a ticket-maker` shows no `ecomanda delivery failed` errors

## Documentation / KB Updates

- [ ] Add a KB entry in `docs/kb/integrations/` documenting the ecomanda Fly.io deployment and URL — run `document-solution` after completion.
- [ ] Run `check-kb-index` after adding the KB doc.

## Completion Criteria

- [ ] SC-005: ticketmaker successfully sends a WhatsApp message through the new Fly.io ecomanda URL
- [ ] All accounts have `ecomanda_base_url` updated in production DB
- [ ] ticketmaker messaging tests pass
- [ ] Heroku ecomanda scaled to 0 (or deleted)
- [ ] KB doc created for ecomanda Fly.io deployment
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

No parallel tasks in this phase.
