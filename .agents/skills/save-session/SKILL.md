---
name: save-session
description: Creates a typed session handoff document for resuming work later
---

# Save Session

## Context Required
MEDIUM-CONTEXT: Current task state, files changed, decisions made, remaining work

## Setup

1. Load `.agents/memory/project-profile.md` (always)
2. Load `.agents/memory/decisions.md` if this skill touches architecture
3. Check `docs/kb/README.md`; read any matching doc before grepping code
4. Explore codebase patterns only after steps 1–3

Skip steps not relevant to this skill's scope.

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
**State**: in_progress | blocked | ready_for_review | completed

## Summary
[1-3 sentence description of what was being worked on and where things stand]

## Open Questions
- [ ] [Unresolved question or uncertainty]

## Next Steps
1. [Specific next action]
2. [Then this]

## Files Touched
- `path/to/file` — what changed and why

## Blockers
- [Any blockers — or "none"]

## Decisions Made
- [Decision and rationale — or "none"]

## Resume
Read this file, then: [specific instruction to orient the next session]
```

3. **Append to `.agents/memory/log.md`**:
```
## [ISO8601] handoff_created | [Brief Description]
```

4. **Show path and resume instruction** to user
