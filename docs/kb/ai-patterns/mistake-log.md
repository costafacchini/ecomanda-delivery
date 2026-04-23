# Mistake Log

**Last Updated**: 2026-04-23
**Context**: Read at session start to avoid repeating known error patterns.

When the AI is corrected, `log-mistake` appends an entry here.
Entries reaching count 3+ get escalated to AGENTS.md "Things to Avoid".

---

## [2026-04-22] Reconcile plan done criteria before updating plan status or index rows

**Wrong**: Updated the dependency-injection plan progress and the plans index without first
rechecking the plan's `Done When` criteria.
**Correct**: Before marking plan waves complete or syncing `.plans/README.md`, audit the
plan's `Done When` checklist and keep any unmet criteria explicit in the plan document.
**Area**: Plan maintenance, status reporting
**Prevention**: When touching a plan status or index row, cross-check the overview's task
table and `Done When` checklist in the same pass, and add a pending task if a criterion is
not yet represented by the task list.
**Count**: 1

## [2026-04-21] Verify test/runtime compatibility before adopting an ESM-only package API

**Wrong**: Updated `src/app/services/Backup.js` to use `bl` v7 directly without checking that the repo's Jest setup transpiles app code to CommonJS.
**Correct**: Confirm package format compatibility with the project's runtime and test pipeline first; in this repo, avoid top-level `bl` imports in app code or replace the usage with native streams.
**Area**: Dependency upgrades, Jest module resolution
**Prevention**: Before applying a library migration, run or inspect a representative test path that loads the changed module and check whether the repo mixes ESM app code with CommonJS test transforms.
**Count**: 1

## [2026-04-21] Create and switch to the plan branch before executing plan work

**Wrong**: Started executing `.plans/decouple-mongo` on `main` instead of creating and switching to the plan branch first.
**Correct**: When a plan overview declares a branch, create or switch to that branch before making plan changes so the work stays isolated from `main`.
**Area**: Plan execution workflow, git branching
**Prevention**: During plan startup, treat `**Branch**` in `.plans/<slug>/overview.md` as a required preflight check alongside status and dependencies.
**Count**: 1

## [2026-04-22] Add characterization tests before refactoring when the user asks for proof first

**Wrong**: Started planning runtime refactors for the remaining service-layer model imports before adding tests to lock current behavior.
**Correct**: When the user asks to make sure changes are correct first, write characterization tests for the affected code paths before editing the implementation.
**Area**: Refactor workflow, test strategy
**Prevention**: Treat a user request for upfront correctness checks as a test-first requirement and update the implementation plan before preparing code patches.
**Count**: 1

## [2026-04-23] Confirm existing env-driven defaults before treating them as mismatches

**Wrong**: Treated the frontend proxy target as a hardcoded local-port mismatch and changed the default to `5000` without first confirming that `5001` was an intentional default chosen by the user.
**Correct**: Before “fixing” local runtime defaults, confirm whether the current value is already an intentional env-driven convention and preserve that default unless the user asks to change it.
**Area**: Local dev runtime, Vite proxy config, plan assumptions
**Prevention**: When reviewing local ports or env wiring, inspect both the code and the user’s stated convention before classifying a value as inconsistent or updating the default.
**Count**: 1
