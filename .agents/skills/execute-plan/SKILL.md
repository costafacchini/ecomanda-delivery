---
name: execute-plan
description: Runs remaining plan tasks in in a development plan with parallel agent support. Builds a dependency DAG, identifies ready tasks, and runs them in waves with formal phase gates. Supports both agent teams (parallel) and sequential fallback. Use when you want to run all remaining tasks in a plan.
---

# Execute Plan

## Context Required
HIGH-CONTEXT: Full plan directory (.plans/{slug}/), AGENTS.md

## Triggers

### Automatic
- None (manual only)

### Manual
- `/execute-plan`
- "run the plan", "execute remaining tasks", "run all tasks"
- "execute the [plan-slug] plan"
- "continue the plan"

---

## Instructions

### Step 1: Load Plan State

1. Read `.plans/{plan-slug}/overview.md` for phases and dependencies
2. Read ALL `status.md` files to build current state map
3. Categorize each task: `complete`/`adapted` (skip), `in-progress` (monitor, do not re-schedule), `blocked` (wait), `ready` (execute)
4. Detect directory layout: flat (`task-NN-slug/`) or phased (`phase-N/task-NN-slug/`)
5. Before scheduling any ready task, verify its `task.md` still has explicit `Testing` and `Documentation / KB Updates` sections. If either is missing or too vague to execute, tighten the task definition before implementation starts.

A task is **ready** when:
- Status is `not-started` or `blocked` (with blockers now resolved)
- All tasks in its "Depends On" list are `complete` or `adapted`

**Sizing check**: If plan has >15 tasks or >4 phases, warn and suggest splitting.

### Step 2: Build Execution Waves

Group ready tasks into waves based on the dependency DAG:

- **Wave 1**: All currently ready tasks (no unmet dependencies)
- **Wave 2**: Tasks that become ready after Wave 1 completes
- **Wave N**: Continue until all tasks are scheduled

Present the execution plan to the user:
```text
Execution Plan for: {plan-slug}
================================
Completed: task-01, task-02 (skipping)
Wave 1: task-03, task-04 (parallel)
Wave 2: task-05 (depends on Wave 1)
Blocked: task-06 (external dependency)
================================
Proceed? (y/n)
```

### Step 3: Execute Wave (Sequential — Default)

For each wave, execute tasks one at a time:

1. Execute each ready task via `execute-task`
2. After each task, re-read status files to check for newly unblocked tasks
3. Continue until wave is complete

> **Claude Code Enhancement (optional)**: If the tool supports parallel agent execution, tasks within the same wave (no cross-dependencies) can be run concurrently — one agent per task, each in its own worktree. Right-size to 3-5 agents per wave. This is optional; the sequential path above is always sufficient.

### Step 4: Execute Wave (Parallel Agent Teams — Optional)

If the tool supports parallel agent execution and the user opts in:

1. Spawn one agent per ready task in the wave (right-size to 3-5 per wave)
2. Each agent runs `execute-task` for its assigned task in its own worktree
3. Monitor progress via task status updates
4. Wait for all agents in the wave to complete before advancing

### Step 5: Handle Blockers

If a task is blocked:
- Present blocker details to the user
- Offer options: skip (mark as adapted), resolve manually, or abort plan
- If resolved, re-check the DAG and continue

### Step 6: Phase Gate Verification

After each wave/phase completes, verify before proceeding:

1. All Phase N tasks are `complete` or `adapted`
2. Required tests / verification for the completed tasks were added and run, or any intentional gaps are explicitly documented and approved
3. CI is green for the completed work (or any failures are understood/flaky)
4. No tasks required for the current phase or next ready wave remain `blocked`
5. Contracts are still accurate (for cross-repo plans)
6. Required KB / documentation updates for the completed tasks are merged or explicitly tracked before the next wave starts
7. Any PR/review/merge follow-up is tracked and reported before the next wave starts; merge timing itself is not a gate unless the plan explicitly depends on it
8. If the plan is GTM-flagged, verify each PR in the wave includes `GTM Plan: <plan-slug>` in the body and the `gtm-ship` label (apply via `gh` when available)

If any gate check fails, report the issue and wait for resolution.

### Step 7: Cross-Repo Coordination

For cross-repo plans:
- In a dedicated planning worktree, sync the planning branch (fetch + fast-forward/rebase) before updating `status.md` between waves
- Verify contract status (Draft/Frozen/Deprecated) is appropriate for the current phase
- Note cross-repo dependencies in wave presentation

### Step 8: Consolidation PR (Optional)

After all tasks in a phase merge individually, offer a consolidation PR:
- Verifies the combined result works end-to-end
- Runs integration tests across merged changes
- Provides a single review point for the phase

### Step 9: Plan Completion

When all tasks are `complete` or `adapted` (or remaining are blocked and unresolvable):

1. Update `.plans/{plan-slug}/overview.md` status to `complete`
2. Move the plan from Active to Completed table in `.plans/README.md`
3. Report summary:
   - Total tasks completed vs adapted vs blocked
   - List of branches created
   - Test / verification and KB/doc follow-up status
   - Suggested next steps (PR creation, merge strategy)

## Output

- All plan tasks executed (or blocked with explanations)
- Status files updated for every task
- Phase gate verifications passed
- Plan overview and index updated
- Summary report with branch list and completion stats

## Examples

User: "/execute-plan user-auth"

Agent:
1. Reads plan: 6 tasks, 3 phases. Tasks 01-02 already complete.
2. Builds waves: Wave 1 = [task-03, task-04], Wave 2 = [task-05, task-06]
3. Presents: "2 waves remaining. Wave 1 has 2 parallel tasks. Proceed?"
4. User confirms → spawns 2 agents for task-03 and task-04
5. Both complete → runs phase gate: CI green, no blockers, follow-up review/merge work tracked
6. Presents Wave 2 → executes task-05 and task-06
7. All complete → updates overview to "complete", reports summary
