# Task: Vitest — Update Licensee Form Tests

**Plan**: Licensee Form Wizard
**Task ID**: task-05
**Task Path**: phase-3/task-05-tests
**Depends On**: phase-2/task-04-tab-shell
**JIRA**: N/A

## Before You Start

- [ ] Confirm task-04 is `complete` or `adapted`
- [ ] Run existing tests to establish baseline: `npx jest --testPathPattern=Licensees`
- [ ] Read existing test files for the Licensees form to understand current assertions

## Context

After the tab shell is in place, some existing tests may need selector or structure updates. This task audits the current test coverage, updates failing assertions, and adds any new tests for tab-switching behavior.

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Licensees/**/*.spec.js` (or `.test.js`) | modify | Update selectors and add tab tests |
| `client/src/pages/Licensees/**/*.spec.jsx` (or `.test.jsx`) | modify | If JSX test files exist |

### Do NOT Modify

- Panel component files (owned by Phase 1)
- `Form/index.js` — test-only task

## Conflict Avoidance Notes

Only task in Phase 3 — no parallel conflicts.

## Implementation Steps

### Step 1: Run existing tests and capture failures
```bash
npx jest --testPathPattern=Licensees --verbose 2>&1 | head -100
```

### Step 2: Fix broken selectors
Tests that previously queried fields by label or placeholder directly on the form page may need updating if the tab structure changes DOM nesting. Update selectors to match the new structure.

### Step 3: Add tab-switching tests (if worthwhile)
If the tests use a component renderer (e.g. @testing-library/react), add tests for:
- Default active tab is 'Geral'
- Clicking a tab activates it
- Selecting 'baileys' as whatsappDefault shows the WhatsApp tab nav item

### Step 4: Verify all tests pass
```bash
npx jest --testPathPattern=Licensees
```

## Testing

- [ ] All existing Licensees tests pass
- [ ] Any new tab-behavior tests added and passing
- [ ] `npx eslint .` passes

## Documentation / KB Updates

No KB/doc updates required unless new non-obvious patterns were introduced.

## Completion Criteria

- [ ] All Licensees tests pass (including any new tab tests)
- [ ] No skipped or xfailed tests introduced
- [ ] `npx eslint .` passes
- [ ] Status updated in status.md
