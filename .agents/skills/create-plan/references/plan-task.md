# Task: [TASK TITLE]

<!-- Replace [TASK TITLE] with a concise description of what this task accomplishes -->

**Plan**: [Plan name]
**Phase**: [Phase number]
**Task ID (phase-local)**: task-{NN}
**Task Path**: [task-path] (for example `task-01-db-schema` or `phase-1/task-01-db-schema`)
**Depends On**: [{task-path}, {task-path}] or "None"
**JIRA**: {JIRA-TICKET-KEY} or "N/A"

## Objective

[1-2 sentence description of what this task accomplishes]

## Context

<!-- Background the executing agent needs. Reference specific files, architecture docs, contracts,
     and patterns. Include links. The agent should be able to execute this task by reading just
     this file plus the referenced documents. -->
[Background information needed to execute this task. Reference relevant docs, existing patterns, or decisions from the plan overview.]

## Before You Start

<!-- MANDATORY pre-flight checklist. Complete every item before writing any code. -->

- [ ] Switch to the planning/base branch and pull the latest plan state: `git switch {base-branch} && git pull --rebase origin {base-branch}`
- [ ] If `JIRA` is not "N/A", read ticket {JIRA-TICKET-KEY}: check description AND comments for latest requirements
- [ ] Verify every prerequisite task in `Depends On` is complete. If `Depends On` is not "None", check each listed task's `status.md` shows `complete` or `adapted`
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Read referenced architecture docs:
  - {path/to/relevant-doc.md}
- [ ] Mark this task `in-progress` in `status.md` before proceeding

<!-- If JIRA or docs contradict this task file, the live sources win. Adapt and document
     the deviation in status.md. See the Adaptation Protocol in the plans spec. -->

## File Ownership

<!-- Files this task is authorized to create or modify. No other task in this phase
     may touch these files. If you need a file owned by another task, stub the dependency. -->

| File | Action | Notes |
|------|--------|-------|
| [path/to/file] | create / modify | [Brief note] |

### Do NOT Modify

<!-- Files owned by sibling tasks in this phase, or shared resources that must not change.
     Making this explicit prevents accidental conflicts. -->

- `{path/to/file}` — owned by {task-path}
- `{path/to/shared-file}` — shared resource, read-only

## Implementation Steps

### Step 1: [Action]
[Detailed instructions]

### Step 2: [Action]
[Detailed instructions]

### Step 3: [Action]
[Detailed instructions]

## Testing

- [ ] [Test requirement 1]
- [ ] [Test requirement 2]
- [ ] Existing tests still pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] Update existing docs / KB files affected by this task, or explicitly note "No KB/doc updates required"
- [ ] If no KB doc exists for the changed subsystem and this task introduces a reusable or non-obvious pattern, run `document-solution`
- [ ] If KB files change, run `check-kb-index`

## Completion Criteria

- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] Documentation / KB updates completed or explicitly marked not needed
- [ ] Changes committed to `plan/[plan-slug]/[task-path]` branch
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

<!-- Guidance for avoiding conflicts with parallel tasks. Delete this section if there
     are no parallel tasks in the current phase. -->

- {task-path} creates {resource} that this task consumes. If that task is not yet complete,
  stub the interface and revisit after it merges.
- This task adds {new file}. Do not modify {existing file} owned by {task-path}.
