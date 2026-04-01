---
name: save-session
description: Creates a session handoff document for resuming work later
trigger: Long session (20+ turns), user pausing, or explicit request
auto: false
---

# Save Session

## Triggers

### Automatic

Offer proactively when:
- Session reaches 20+ turns with in-progress work
- User says "let's pause", "continue later", "stop for now"
- User indicates switching to a different task mid-work
- End of workday context

### Manual
- `/save-session`
- "save session"
- "create handoff doc"
- "I'll continue this later"
- "pause here"

---

## When
- Long sessions (20+ turns) — offer proactively
- User pausing mid-task
- Explicit request

## Steps

1. **Gather context** — task, decisions, files changed, remaining work
2. **Create** `docs/kb/sessions/YYYY-MM-DD_brief-description.md`:

```markdown
# Session: [Brief Description]

**Date**: YYYY-MM-DD
**Status**: In Progress / Blocked / Ready for Review

## What We Were Working On
[Description]

## Decisions Made
- [Decision and rationale]

## Files Changed
- `path/to/file` — what changed

## Next Steps
1. [Next thing]
2. [Then this]

## Blockers
- [Any blockers]

## Resume Command
Continue from docs/kb/sessions/YYYY-MM-DD_brief-description.md
```

3. **Show path and resume command** to user
