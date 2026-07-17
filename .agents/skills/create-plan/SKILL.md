---
name: create-plan
description: Creates a git-native development plan from a feature description with dependency-ordered tasks and .plans/ directory structure.
---

# Create Plan

## Context Required
HIGH-CONTEXT: AGENTS.md, KB index, relevant codebase files, and project conventions

## Setup

1. Load `.agents/memory/project-profile.md` (always)
2. Load `.agents/memory/decisions.md` if this skill touches architecture
3. Check `docs/kb/README.md`; read any matching doc before grepping code
4. Explore codebase patterns only after steps 1–3

Skip steps not relevant to this skill's scope.

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

**PR Strategy** — ask the user which PR strategy they want for this plan:
- **per-task**: Each task opens its own PR when complete. Best for granular review.
- **per-wave**: One PR per wave after all tasks in the wave complete. Best for grouped review.
- **single**: One PR for the entire plan after all tasks complete. Best for atomic delivery.

Record the chosen strategy in `overview.md` as `**PR Strategy**`.

### Step 2: Explore Codebase Context

1. Read `AGENTS.md` for project conventions and constraints
2. Check `docs/kb/README.md` for relevant KB docs
3. Explore relevant source files to understand existing patterns
4. Identify files that will need to be created or modified
5. Identify the existing tests and validation harnesses that cover this area
6. Detect the project's test framework: `spec/` → RSpec, `tests/` + `conftest.py` → pytest, `*.test.ts` / `*.spec.ts` → Jest/Vitest, `*_test.go` → Go test, etc.
7. Identify the existing KB/docs that should be updated, or note that the work may require a new KB entry via `document-solution`

### Step 3: Generate Feature Spec

Using the gathered requirements and codebase context, generate `spec.md` from `references/spec.md`:

1. Write **User Stories** — one per major user journey, priority-ordered (P1 first). Each story must be independently testable.
2. For each story, write **Acceptance Scenarios** in Given/When/Then format. Be concrete: name specific UI elements, API endpoints, or state transitions.
3. Write **Functional Requirements** (FR-XXX) — system-level constraints derived from the stories.
4. Write **Success Criteria** (SC-XXX) — measurable outcomes that define "done" for the whole feature.
5. List **Assumptions** — scope boundaries and external dependencies.

Present the spec to the user and confirm before proceeding. If the user requests changes, update the spec before moving to Step 4.

### Step 4: Generate Plan Slug

Create a kebab-case slug (2-5 words) from the feature description.

Examples: `system-logs`, `api-endpoints`

### Step 5: Break Into Tasks

Design tasks with these principles:

1. **Clear file ownership** — Each task owns specific files. No two concurrent tasks should modify the same file.
2. **Dependency ordering** — Tasks that must run sequentially share a dependency chain. Independent tasks can be parallelized.
3. **Right-sized** — Each task should be completable in a single agent session (roughly 1-20 file changes).
4. **Zero-padded IDs** — Use `task-01`, `task-02`, etc. for correct sort order. Pair each task ID with a unique `{task-path}` such as `task-01-api-endpoint` or `phase-1/task-01-api-endpoint`.
5. **Quality and knowledge ownership** — Every implementation task must own the test coverage / verification it needs and any KB/doc updates it triggers, or explicitly document why no test or KB work is required.

For each task, populate from `references/plan-task.md`:
- **Task ID**: `task-{NN}`
- **Task Path**: `{task-path}` (for example `task-01-api-endpoint` or `phase-1/task-01-api-endpoint`)
- **Spec References**: List which spec User Stories and FR-XXX this task implements (e.g., "Story 1 (P1), FR-001, FR-002")
- **JIRA**: Link to JIRA ticket or "N/A"
- **Before You Start**: Pre-flight checklist (see template)
- **Do NOT Modify**: Cross-reference files owned by sibling tasks in the same phase
- **Conflict Avoidance Notes**: Guidance for parallel execution
- **Testing**: Required unit/integration/e2e/manual verification, with concrete test files or harnesses whenever they are known. **For each Acceptance Scenario in the referenced spec stories, generate a test stub in the detected test framework** — one test case per Given/When/Then, marked pending/skipped. List these stub files in the task's File Ownership table.
- **Documentation / KB Updates**: Existing docs to update, or an explicit "No KB/doc updates required" note. If no KB exists and the task introduces a reusable/non-obvious pattern, note that `document-solution` should run on completion.

If the implementation and its required tests/KB updates are too large for one task, split them into dependency-ordered sibling tasks instead of leaving validation or documentation as an unspecified follow-up.

**Sizing validation**: Warn if plan exceeds 15 tasks or 4 phases — suggest splitting.

### Step 6: Group Into Phases

Organize tasks into phases based on dependencies:
- Phase 1: Tasks with no dependencies (can all run in parallel)
- Phase 2: Tasks that depend on Phase 1 outputs
- Phase 3+: Continue the dependency chain

### Step 7: Create Directory Structure

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

Create the plan overview and spec:
- `spec.md` — Generated in Step 3, finalized here. Copy from working draft.
- `overview.md` — Populated from `references/plan-overview.md` with phases, dependencies, task summary, and a link to `spec.md`

Reference templates in this skill's `references/` directory:
- `references/plan-overview.md`
- `references/plan-task.md`
- `references/plan-task-status.md`
- `references/plan-contract.md`

### Step 8: Update Plans Index

Add the new plan to `.plans/README.md` in the Active Plans table:

```markdown
| [{Plan Title}]({slug}/overview.md) | {Objective} | 0/{N} | not-started | {YYYY-MM-DD} |
```

### Step 9: Commit Plan to a Branch and Open PR

All plan files must be reviewed and merged into `main` before any task execution begins.

```bash
git fetch origin
git switch main
git pull origin main
git switch -c plan/{slug}
git add .plans/{slug}/ .plans/README.md
# test stubs generated during planning are staged here too
git commit -m "plan({slug}): create plan"
git push -u origin plan/{slug}
gh pr create \
  --base main \
  --title "plan({slug}): [Plan Title]" \
  --body "## Plan: [Plan Title]

[1-2 sentence objective]

**Type**: Type 1 / 2 / 3
**Phases**: N  **Tasks**: N
**Assigned Dev**: [NAME]

> Merge this PR before running \`/execute-plan {slug}\` or any \`/execute-task\`."
```

### Step 10: Report Summary

Present the plan to the user:
- Plan name, slug, and type classification
- Spec: number of user stories, total acceptance scenarios, and SC-XXX criteria
- Number of phases and tasks
- Dependency graph (which tasks can run in parallel)
- Test stubs generated: list stub files created from acceptance scenarios
- Planned KB / documentation follow-up
- Branch convention
- PR link — **execution is blocked until this PR is merged into `main`**
- Suggest next step: after merging, run `/execute-plan {slug}` or `/execute-task {slug}/{task-path}`

### Step 11: Present for Approval

Present the full plan for user approval. The PR must be merged into `main` before any `/execute-plan` or `/execute-task` may proceed.

## Output

- `.plans/{slug}/spec.md` — finalized feature spec with user stories, acceptance scenarios, FR-XXX, SC-XXX
- `.plans/{slug}/overview.md` — phases, task table, risks, spec link
- `.plans/{slug}/` task directories with task.md and status.md
- Test stub files (one per acceptance scenario, pending/skipped) committed alongside the plan
- Updated `.plans/README.md` index
- Summary of plan structure presented to user

## Examples

User: "/create-plan Add user authentication with OAuth"

Agent explores codebase, generates spec (2 user stories, 5 acceptance scenarios), confirms with user, then creates:
```text
.plans/user-auth/
  spec.md              (Story 1: sign-up flow P1 / Story 2: login P2, FR-001..004, SC-001..003)
  overview.md          (3 phases, 6 tasks, spec link)
  phase-1/
    task-01-db-schema/
      task.md          (Spec refs: Story 1 P1, FR-001. Test stubs: spec/models/user_spec.rb)
      status.md        (not-started)
    task-02-auth-service/
      task.md          (Spec refs: Story 1 P1 + Story 2 P2, FR-002..003. Test stubs: spec/services/auth_service_spec.rb)
      status.md        (not-started)
  ...
spec/models/user_spec.rb          ← stub: 2 pending scenarios from Story 1
spec/services/auth_service_spec.rb ← stub: 3 pending scenarios from Stories 1+2
```

Reports: "Created plan 'user-auth' (Type 1 Product) — spec: 2 stories, 5 scenarios, 3 success criteria. 6 tasks across 3 phases. 2 test stub files generated. Tasks 01-02 can run in parallel. Run `/execute-plan user-auth` to start."

