---
name: execute-task
description: Executes a single task from a development plan. Loads task context, runs pre-flight checks, creates a git branch, follows implementation steps with adaptation protocol, runs tests, and updates status. Use when working on a specific plan task.
---

# Execute Task

## Context Required
HIGH-CONTEXT: Plan overview, task definition, dependency status files, AGENTS.md

## Triggers

### Manual
- `/execute-task {plan-slug}/{task-path}`
- "work on {task-path} from {plan}"
- "execute {task-path} in {plan}"
- "pick up {task-path} from {plan}"

## Instructions

### Step 1: Load Task Context

Task dirs may be flat (`task-XX-{slug}`) or phased (`phase-N/task-XX-{slug}`).

1. Read `.plans/{plan-slug}/overview.md`
2. Read `.plans/{plan-slug}/{task-path}/task.md`
3. Read `.plans/{plan-slug}/{task-path}/status.md`
4. **If `investigation.md` exists** — bug plan. Read for root cause context, severity, and test gap analysis.

If `complete`, inform and stop. If `in-progress`, ask to resume or restart.

### Step 2: Pre-Flight Protocol

1. **Resume path**: Already on task branch with uncommitted work → resume. On another branch with uncommitted changes → stop and ask to commit/stash. Otherwise: `git switch {base-branch} && git pull origin {base-branch}`.
2. **Read JIRA**: If referenced, read description AND comments for latest requirements.
3. **Prerequisites**: For each dependency, read `status.md` — must be `complete` or `adapted`. Report blockers and stop if not.
4. **Verify status accuracy**: Investigate stale state (e.g., `not-started` but branch exists).
5. **Read referenced docs**: Load architecture docs and contracts from task.md.
6. **Review existing tests** for the affected area.
7. **Review KB/docs** for the affected subsystem.

### Step 3: Create Git Branch

```bash
git fetch origin
if git show-ref --verify --quiet refs/heads/plan/{plan-slug}/{task-path}; then
  git switch plan/{plan-slug}/{task-path}
elif git ls-remote --exit-code --heads origin plan/{plan-slug}/{task-path} >/dev/null 2>&1; then
  git switch --track -c plan/{plan-slug}/{task-path} origin/plan/{plan-slug}/{task-path}
else
  git switch -c plan/{plan-slug}/{task-path}
fi
```

**Mark in-progress**: Update status.md to `in-progress` after switching.

### Step 4: Check File Ownership

Verify each file is in the File Ownership table before modifying. If in **Do NOT Modify**, stub and note in status.md.

### Step 5: Execute Implementation Steps

Priority order when contradictions found: **JIRA** > **Architecture docs** > **Task file**.

**Adapt within task**: Different path to same outcome, minor requirement changes, different patterns found.

**Escalate (mark blocked)**: Scope changed, new unplanned dependencies, file ownership conflict, kill criterion, or bug discovered (→ Step 5a).

Document all adaptations in status.md. Implement tests and KB/doc updates called for in task.md as part of the same task unless explicitly split.

### Step 5a: Bug Discovery Protocol

**Triage**:

| Situation | Action |
|-----------|--------|
| Small bug in code you're changing | Fix inline; add regression test; document as adaptation |
| Larger bug that blocks your task | Add defect task (below); mark this task `blocked` |
| Pre-existing, doesn't block | Log in plan's Defects table; create Jira; continue |
| Unrelated bug | Create Jira ticket only; do NOT add to plan; continue |

**Adding a defect task** (when it blocks):
1. Assign next task number: `task-{NN}-defect-{short-description}`
2. Create directory with `task.md` (from `references/defect-task.md`) and `status.md` (`not-started`)
3. Add to `overview.md` Task Summary table and Defects table
4. Update current task's `status.md`: add blocker, set `blocked`
5. Commit: `plan({slug}): add defect task {defect-task-path}`
6. Inform user and stop. Run `/execute-task {slug}/{defect-task-path}` to fix first.

**Note**: Agent-discovered bugs use this protocol. Human-reported bugs use **`/add-defect {plan-slug}`** instead.

### Step 6: Run Verification

1. Implement/update tests; document any gaps in status.md
2. Run project tests (per AGENTS.md test command)
3. Run `pre-commit-check`
4. Verify completion criteria from task.md
5. Update KB/docs if task changes documented behavior; run `document-solution` for new non-obvious patterns; run `check-kb-index` if KB files changed
6. If KB/docs changed, re-run `pre-commit-check` on those files

**Bug plan extra** (if `investigation.md` exists): Verify regression test fails pre-fix and passes after; confirm fix matches root cause; check consumer impact for affected systems; P0/P1 requires test evidence in status.md artifacts.

### Step 7: Update Status and Plan Index

Update status.md: `complete` (or `adapted`), timestamp, branch/PR link, Adaptations if adapted.
Update task status in `overview.md` task summary table.
Update progress in `.plans/README.md`.

### Step 8: Commit and Push

```bash
git add [owned files] .plans/{plan-slug}/{task-path}/status.md .plans/{plan-slug}/overview.md .plans/README.md
git commit -m "plan({plan-slug}): {task title}"
git push -u origin plan/{plan-slug}/{task-path}
```

### Step 9: Report Completion

- Task result (or adapted with deviation summary)
- Branch, files changed, verification results
- KB/docs update outcome; newly unblocked tasks
- Bug plan completion status (if Step 9a ran)
- Suggest next task
