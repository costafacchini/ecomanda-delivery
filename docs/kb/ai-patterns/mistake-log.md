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

## [2026-04-23] When a plan branch has already been merged, create a fresh branch for the next execution wave

**Wrong**: Treated the original `feature/decouple-mongo` branch in the plan as the branch to continue working from even after the user had already merged that work.
**Correct**: Before executing the next plan wave, confirm whether the recorded branch is still active; if it was already merged, create a new branch from `main` for the next phase and update the plan reference.
**Area**: Plan execution workflow, git branching
**Prevention**: During plan preflight, check both the plan branch field and the user’s current branch state, and treat merged historical branches as stale execution metadata that must be replaced before coding.
**Count**: 1

## [2026-04-23] Re-run controller error-path specs after repository create refactors

**Wrong**: Changed repository `create()` implementations to use `Model.create(...)` and reported the decouple-mongo wave as validated without rerunning the controller specs that mock `Model.prototype.save` to force create failures.
**Correct**: Preserve compatibility with existing error-path tests when refactoring repository persistence, or rerun and update those specs immediately before claiming the wave is green.
**Area**: Repository refactors, controller regression coverage
**Prevention**: After changing create/save semantics in repositories, explicitly rerun any specs that mock `Model.prototype.save` or `repository.save()` and treat those paths as required validation, not optional follow-up.
**Count**: 1

## [2026-04-24] Reproduce the real lint command before declaring a lint-clean commit

**Wrong**: Reported the decouple-mongo wave as lint-clean based on a commit-time diff-scoped check path that did not reproduce the repo's actual lint command and missed `require-await` errors introduced in migrated spec hooks.
**Correct**: Before reporting lint as clean, run the same ESLint command the branch/CI actually uses for the touched area and verify that the exit status is free of errors, not just that a helper command produced no output.
**Area**: Validation workflow, ESLint, test-spec migrations
**Prevention**: When a wave changes many files or rewrites test setup, always rerun the canonical lint command for the affected directories after the final edit pass, even if a narrower pre-commit scan looked clean earlier.
**Count**: 1
