---
name: create-plan
description: >-
  Creates a git-native development plan from a feature description. Explores the
  codebase, breaks work into dependency-ordered tasks with file ownership boundaries,
  and generates the full .plans/ directory structure. Use when starting a new feature,
  project, or multi-step implementation.
---

# Create Plan

## Context Required
HIGH-CONTEXT: AGENTS.md, KB index, relevant codebase files, and project conventions

## Triggers

### Manual
- `/create-plan`
- `/create-plan [feature description]`
- "create a plan for..."
- "plan this feature"
- "break this into tasks"
- "I need a plan for..."

## Instructions

### Step 1: Gather Feature Description & Classify

If not provided as an argument, ask the user to describe the requirements of the feature or project.

Gather:
- What needs to be built or changed
- Any constraints or requirements
- Desired outcomes

Classify the plan type:
- **Type 1 (Product)**: User-facing behavior change
- **Type 2 (Technical)**: Infrastructure, refactor, performance, security
- **Type 3 (Bug/Support)**: Reactive fix from L3 or escalation

### Step 2: Explore Codebase Context

1. Read `AGENTS.md` for project conventions and constraints
2. Check `docs/kb/README.md` for relevant KB docs
3. Explore relevant source files to understand existing patterns
4. Identify files that will need to be created or modified
5. Identify the existing tests, validation harnesses, or QA workflows that cover this area
6. Identify the existing KB/docs that should be updated, or note that the work may require a new KB entry via `document-solution`

### Step 3: Generate Plan Slug

Create a kebab-case slug (2-5 words) from the feature description.

Examples: `system-logs`, `api-endpoints`

### Step 4: Break Into Tasks

Design tasks with these principles:

1. **Clear file ownership** — Each task owns specific files. No two concurrent tasks should modify the same file.
2. **Dependency ordering** — Tasks that must run sequentially share a dependency chain. Independent tasks can be parallelized.
3. **Right-sized** — Each task should be completable in a single agent session (roughly 1-20 file changes).
4. **Zero-padded IDs** — Use `task-01`, `task-02`, etc. for correct sort order. Pair each task ID with a unique `{task-path}` such as `task-01-api-endpoint` or `phase-1/task-01-api-endpoint`.
5. **Quality and knowledge ownership** — Every implementation task must own the test coverage / verification it needs and any KB/doc updates it triggers, or explicitly document why no test or KB work is required.

For each task, populate from `references/plan-task.md`:
- **Task ID**: `task-{NN}`
- **Task Path**: `{task-path}` (for example `task-01-api-endpoint` or `phase-1/task-01-api-endpoint`)
- **JIRA**: Link to JIRA ticket or "N/A"
- **Before You Start**: Pre-flight checklist (see template)
- **Do NOT Modify**: Cross-reference files owned by sibling tasks in the same phase
- **Conflict Avoidance Notes**: Guidance for parallel execution
- **Testing**: Required unit/integration/e2e/manual verification, with concrete test files or harnesses whenever they are known
- **Documentation / KB Updates**: Existing docs to update, or an explicit "No KB/doc updates required" note. If no KB exists and the task introduces a reusable/non-obvious pattern, note that `document-solution` should run on completion.

If the implementation and its required tests/KB updates are too large for one task, split them into dependency-ordered sibling tasks instead of leaving validation or documentation as an unspecified follow-up.

**Sizing validation**: Warn if plan exceeds 15 tasks or 4 phases — suggest splitting.

### Step 5: Group Into Phases

Organize tasks into phases based on dependencies:
- Phase 1: Tasks with no dependencies (can all run in parallel)
- Phase 2: Tasks that depend on Phase 1 outputs
- Phase 3+: Continue the dependency chain

### Step 6: Create Directory Structure

**Flat layout** (≤5 tasks):
```bash
mkdir -p .plans/{slug}/task-XX-{task-slug}
```

**Phased layout** (>5 tasks):
```bash
mkdir -p .plans/{slug}/phase-N/task-XX-{task-slug}
```

For each task, create:
- `task.md` — Populated from `references/plan-task.md`
- `status.md` — Initialized from `references/plan-task-status.md`

Create the plan overview:
- `overview.md` — Populated from `references/plan-overview.md` with phases, dependencies and task summary

Reference templates in this skill's `references/` directory:
- `references/plan-overview.md`
- `references/plan-task.md`
- `references/plan-task-status.md`
- `references/plan-contract.md`

### Step 7: Update Plans Index

Add the new plan to `.plans/README.md` in the Active Plans table:

```markdown
| [{Plan Title}]({slug}/overview.md) | {Objective} | 0/{N} | not-started | {YYYY-MM-DD} |
```

### Step 8: Report Summary

Present the plan to the user:
- Plan name, slug, and type classification
- Number of phases and tasks
- Dependency graph (which tasks can run in parallel)
- Planned test / verification coverage
- Planned KB / documentation follow-up
- Branch convention
- Suggest next step: `/execute-plan {slug}` or `/execute-task {slug}/{task-path}` (for example `/execute-task {slug}/task-01-db-schema` or `/execute-task {slug}/phase-1/task-01-db-schema`)

### Step 9: Present for Approval

Present the full plan for user approval before any execution begins. Do not proceed with `/execute-plan` or `/execute-task` until confirmed.

## Output

- `.plans/{slug}/` directory with overview.md and task directories
- Updated `.plans/README.md` index
- Summary of plan structure presented to user

## Examples

User: "/create-plan Add user authentication with OAuth"

Agent explores codebase, identifies auth patterns, and creates:
```text
.plans/user-auth/
  overview.md          (3 phases, 6 tasks, demo 2026-03-12)
  phase-1/
    task-01-db-schema/
      task.md          (Create users table, OAuth tokens)
      status.md        (not-started)
    task-02-auth-service/
      task.md          (OAuth flow implementation)
      status.md        (not-started)
  ...
```

Reports: "Created plan 'user-auth' (Type 1 Product) with 6 tasks across 3 phases. Dev: Alan. Tasks 01-02 can run in parallel. Run `/execute-plan user-auth` to start, or `/execute-task user-auth/phase-1/task-01-db-schema` for the first task."

