---
name: execute-plan
description: Runs remaining plan tasks in dependency order
trigger: User asks to execute or continue a plan
auto: false
---

# Execute Plan

## Triggers

### Manual
- `/execute-plan`
- "run the plan", "execute remaining tasks", "run all tasks"
- "execute the [plan-slug] plan"
- "continue the plan"

---

## Steps

1. **Load** `.plans/{slug}/overview.md`, build dependency graph
2. **Group into waves** — Tasks with no unmet dependencies run together
3. **Execute wave** — Run tasks sequentially (or parallel with agent teams)
4. **Phase gate** — All tasks in wave complete? Tests passing? No blockers?
5. **Next wave** — Repeat until all tasks done
6. **Finalize** — Run pre-commit-check, update plan status to Complete
