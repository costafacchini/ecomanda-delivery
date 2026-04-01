---
name: session-end-checklist
description: End-of-session safety net
trigger: User says "done", "thanks", "bye", "that's all"
auto: true
---

# Session End Checklist

## Triggers

### Automatic

Trigger when user says ANY of:
- "done", "done for now", "that's all", "that's it"
- "thanks", "thank you", "bye", "talk later"
- "ending session", "wrapping up", "stopping here"
- Any indication the session is ending

### Manual
- `/session-end-checklist`
- "run end-of-session check"
- "wrap up"
- "session complete"

---

## Checklist

1. **Uncommitted changes?** — `git status`. Offer to commit (run pre-commit-check first)
2. **Complex solution undocumented?** — 3+ files or 5+ exchanges? Offer `document-solution`
3. **Corrections logged?** — Any missed corrections? Run `log-mistake`
4. **KB files modified?** — Run `check-kb-index`
5. **Long session?** — 20+ turns mid-task? Offer `save-session`
6. **Tests passing?** — If code was modified, suggest running tests

```
## Session End Checklist
- [x] No uncommitted changes
- [x] Solutions documented
- [x] Corrections logged
- [x] KB index current
- [x] Tests passing
```
