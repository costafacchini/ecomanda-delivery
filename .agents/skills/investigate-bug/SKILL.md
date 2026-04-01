---
name: investigate-bug
description: Full bug lifecycle — investigate, root cause, plan fix, document. For when something is broken and you need structured debugging, not ad-hoc poking.
trigger: User reports a bug, error, or unexpected behavior ("this is broken", "getting an error", "this doesn't work", "bug in...")
auto: false
argument-hint: "<description of the bug or error>"
---

# Investigate Bug

## Triggers

### Manual
- `/investigate-bug [description]`
- "this is broken", "getting an error", "there's a bug in..."
- "this doesn't work", "investigate [issue]", "debug [issue]"
- "something's wrong with [feature]"

---

Single-skill bug lifecycle: Investigate -> Root Cause -> Fix -> Verify -> Document.

## Phase 1: Reproduce & Gather Context

1. **Get the facts**:
   - What's the expected behavior?
   - What's the actual behavior?
   - Steps to reproduce (if known)
   - Error messages, stack traces, logs

2. **Search KB for prior art**:
   - Check `docs/kb/bugfixes/` for similar past bugs
   - Check `docs/kb/ai-patterns/mistake-log.md` for related patterns
   - Check `docs/kb/README.md` for docs on the affected area

3. **Reproduce** (if possible):
   - Run the failing scenario
   - Capture the exact error output
   - Note environment details (branch, recent changes, data state)

## Phase 2: Root Cause Analysis

4. **Trace the issue**:
   - Start from the error/symptom and work backward
   - Read the relevant code (don't guess — read)
   - Use `git log --oneline -20 -- <file>` to check recent changes
   - Use `git bisect` for regressions if the breaking commit is unclear

5. **Document root cause** before fixing:

   ```
   ## Root Cause Analysis

   **Symptom**: [what the user sees]
   **Location**: [file:line where the bug lives]
   **Cause**: [why it breaks — be specific]
   **Introduced by**: [commit/change that caused it, if known]
   **Impact**: [what else might be affected]
   ```

## Phase 3: Fix

6. **Assess scope**:
   - **Simple (1-2 files)** -> Fix directly, proceed to Phase 4
   - **Complex (3+ files)** -> Run `create-plan` first, then `execute-task`

7. **Implement the fix**:
   - Minimal change — fix the bug, don't refactor the neighborhood
   - Match existing patterns in the codebase
   - Check for the same bug pattern elsewhere (grep for similar code)

8. **Write regression test**:
   - Test MUST fail without the fix and pass with it
   - Cover the exact scenario that triggered the bug
   - Include edge case if the root cause suggests one

9. **Run full test suite** — ensure no regressions

## Phase 4: Verify & Document

10. **Verify the fix**:
    - Reproduce the original bug scenario — confirm it's fixed
    - Run related tests — confirm no regressions
    - Run `pre-commit-check`

11. **Document in KB** (if non-trivial):
    - Create `docs/kb/bugfixes/{kebab-case-name}.md`:

    ```markdown
    # [Bug Title]

    **Last Updated**: YYYY-MM-DD
    **Context**: [keywords that would lead someone to this doc]

    ## Symptom
    [What the user sees / error message]

    ## Root Cause
    [Why it happens — file:line reference]

    ## Fix
    [What was changed and why]

    ## Regression Test
    [Where the test lives — file:line]

    ## Prevention
    [How to avoid this class of bug in the future]
    ```

    - Run `check-kb-index`

12. **Skip KB doc if trivial** — typos, one-line config fixes, obvious mistakes
    don't need documentation. Only document bugs where the root cause was
    non-obvious or the pattern could recur.

## Output Format

At each phase transition, report progress:

```
## Bug Investigation: [title]

### Status: [Investigating | Root Cause Found | Fixing | Verified]

**Symptom**: ...
**Root Cause**: ... (file:line)
**Fix**: ... (file:line)
**Test**: ... (file:line)
**KB Doc**: docs/kb/bugfixes/... (or "skipped — trivial fix")
```
