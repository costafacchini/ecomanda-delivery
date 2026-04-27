---
name: log-mistake
description: Records AI corrections to build error pattern awareness
---

# Log Mistake

## Context Required
LOW-CONTEXT: AGENTS.md only

## Triggers

### Automatic — detect proactively, do NOT wait for explicit request

Trigger when user says ANY of:
- "that's wrong", "that's not right", "that's incorrect"
- "no, it should be...", "actually...", "not quite..."
- "you forgot to...", "you missed...", "you need to..."
- "we already discussed...", "I told you earlier...", "like I said..."
- "that won't work because...", "the problem with that is..."
- User provides a fix or correction to your output
- User points out a convention/pattern you violated
- User explains why your approach is wrong

### Manual
- `/log-mistake`
- "run log-mistake"
- "log this correction"
- "remember this for next time"

---

## When
User corrects you with phrases like: "that's wrong", "actually...",
"no, it should be...", "you forgot to...", "you missed..."

## Steps

1. **Identify** — What was wrong? What's correct?
2. **Check** `docs/kb/ai-patterns/mistake-log.md` for duplicates (increment count if repeat)
3. **Append entry**:

```markdown
## [YYYY-MM-DD] [Brief description]

**Wrong**: What the AI did
**Correct**: What should have been done
**Area**: Part of the codebase/workflow
**Prevention**: How to avoid this
**Count**: 1
```

4. **Escalate** — If count reaches 3+, add to AGENTS.md "Things to Avoid"
