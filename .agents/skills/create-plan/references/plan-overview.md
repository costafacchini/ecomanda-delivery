# Plan: [PLAN TITLE]

<!-- Replace [PLAN TITLE] with a clear, outcome-oriented name -->

**Status**: not-started | in-progress | complete
**Created**: [DATE]
**Last Updated**: [DATE]
**Estimated Demo Date**: [YYYY-MM-DD]
**Assigned Dev**: [NAME]
**Assigned QA**: [NAME or "unassigned"]
**Master Plan**: {slug or "None"}

<!-- Status values: not-started | in-progress | complete -->
<!-- A plan is in-progress when any task is in-progress. Complete when all tasks are complete or adapted, CI is green for completed work, any PR/review/merge follow-up is tracked, and required KB/doc follow-up is complete or explicitly marked not needed. -->

## Objective

[1-2 sentence description of what this plan accomplishes]

## Scope

### In Scope
- [Item 1]
- [Item 2]

### Out of Scope

<!-- Be explicit about what is excluded and why. This prevents scope creep. -->
- [Item 1] — {reason excluded}
- [Item 2] — {reason excluded}

## Kill Criteria

<!-- From design sprint methodology. If any of these become true, stop work and escalate to leadership. These should be specific, measurable conditions — not vague risks. -->
- {e.g., "If the vendor announces native support for this feature shipping within 4 weeks"}
- {e.g., "If load testing shows >50ms p99 latency on the critical path, invalidating the approach"}
- {e.g., "If the required API is deprecated before we ship"}

## Phases

<!-- Include Name column for phased plans. Omit for flat plans with a single phase. -->

| Phase | Name | Tasks | Dependencies | Description |
|-------|------|-------|--------------|-------------|
| 1 | {Phase name} | task-01, task-02 | None | [Phase description] |
| 2 | {Phase name} | task-03, task-04 | Phase 1 | [Phase description] |
| 3 | {Phase name} | task-05 | Phase 2 | [Phase description] |

## Task Summary

| Task Path | Title | Phase | Status | Depends On |
|-----------|-------|-------|--------|------------|
| phase-1/task-01-db-schema | [Title] | 1 | not-started | — |
| phase-1/task-02-auth-service | [Title] | 1 | not-started | — |
| phase-2/task-03-api-contract | [Title] | 2 | not-started | phase-1/task-01-db-schema |
| phase-2/task-04-ui-flow | [Title] | 2 | not-started | phase-1/task-01-db-schema, phase-1/task-02-auth-service |
| phase-3/task-05-demo-polish | [Title] | 3 | not-started | phase-2/task-03-api-contract, phase-2/task-04-ui-flow |

## Branch Convention

Pattern: `plan/[PLAN-SLUG]/{task-path}`

Example branches:
- `plan/[PLAN-SLUG]/phase-1/task-01-db-schema`
- `plan/[PLAN-SLUG]/phase-2/task-03-api-contract`

Base branch: {main | develop}
<!-- Specify which branch tasks branch from. -->

## Contract References

<!-- Include only for cross-repo plans. Delete this section for single-repo plans. -->

| Contract | Purpose | Status | Consumed By |
|----------|---------|--------|-------------|
| [{contract-name}.md](contracts/{contract-name}.md) | {What this contract defines} | Draft | {phase-2/task-03-api-contract, phase-3/task-05-demo-polish} |

## Key Files

Files most likely to be touched by this plan:

| File/Directory | Relevance |
|----------------|-----------|
| [path] | [Why this file matters] |

## Risks

- Risk 1 — Mitigation
- Risk 2 — Mitigation

## Success Criteria

<!-- These are validated at demo time. Every criterion must be demonstrable. -->
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] All tests pass
- [ ] Required KB / documentation updates are complete or explicitly marked not needed
- [ ] No regressions in existing functionality

## References

<!-- Links to JIRA epic, related plans, architecture docs, or weekly plan brief. -->
- **JIRA Epic**: {JIRA-EPIC-KEY or "N/A"}
- **Weekly Plan Brief**: {link or "N/A"}
- **Related Plans**: {links to related active plans or "None"}
- **Rock Alignment**: {quarterly rock this supports or "N/A"}
