---
name: create-plan
description: Creates a structured plan for a multi-step feature or project
trigger: Starting a new feature, project, or task requiring 3+ files
auto: false
---

# Create Plan

## Triggers

### Manual
- `/create-plan`
- "create a plan", "plan this feature", "break this into tasks"
- "I need a plan for...", "plan this out"
- Starting a new feature that will touch 3+ files or involve 3+ steps

---

## Steps

1. **Gather requirements** — What to build, acceptance criteria, constraints
2. **Research** — Check KB, explore codebase for patterns
3. **Create** `.plans/{plan-slug}/overview.md`:

```markdown
# Plan: [Title]

**Created**: YYYY-MM-DD
**Status**: Draft | Active | Complete
**Branch**: feature/{plan-slug}

## Objective
[What this accomplishes]

## Tasks

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 1 | [description] | Pending | `file1`, `file2` | — |
| 2 | [description] | Pending | `file3` | 1 |
| 3 | [description] | Pending | `file4` | 2 |

## File Ownership
[No two tasks modify the same file]

## Risks
- [Risk and mitigation]

## Done When
- [ ] All tasks complete
- [ ] Tests passing
- [ ] KB updated if needed
```

4. **Present for approval** before execution
