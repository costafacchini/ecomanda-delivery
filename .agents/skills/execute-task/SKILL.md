---
name: execute-task
description: Executes a specific task from a plan
trigger: User asks to work on a plan task
auto: false
---

# Execute Task

## Triggers

### Manual
- `/execute-task`
- "work on task-01", "execute task from [plan]"
- "pick up the next task", "work on [task] from [plan]"
- "run this task"

---

## Steps

1. **Load** plan overview + task spec + relevant KB docs
2. **Pre-flight** — Dependencies complete? Files available? Clean git status?
3. **Execute** — Follow task spec, stay within file ownership boundaries
4. **Post** — Run tests, update task status in overview, flag blockers
5. **Commit** — Run pre-commit-check if ready
