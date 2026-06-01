# Task: Template, Trigger & User Page Types

**Plan**: Client Type Narrowing
**Phase**: 2
**Task ID (phase-local)**: task-06
**Task Path**: phase-2/task-06-template-trigger-user-pages
**Depends On**: phase-1/task-02-entity-services
**JIRA**: N/A

## Objective

Type all components in `client/src/pages/Templates/`, `client/src/pages/Triggers/`, `client/src/pages/Users/`, and `client/src/pages/Dashboard/`, plus the `client/src/components/form/` shared form components.

## Context

These pages follow similar CRUD patterns. Templates and Triggers have form scenes with Formik. Users has a list + form. Dashboard displays metric cards.

The `client/src/components/form/` directory contains shared form components (likely input wrappers) that are used across pages — typing them benefits all pages simultaneously.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-1/task-02-entity-services` is `complete`
- [ ] `ls -R client/src/pages/Templates/ client/src/pages/Triggers/ client/src/pages/Users/ client/src/pages/Dashboard/ client/src/components/form/` to see all files
- [ ] Check this task's `status.md` and mark `in-progress` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Templates/` | modify all | All files recursively |
| `client/src/pages/Triggers/` | modify all | All files recursively |
| `client/src/pages/Users/` | modify all | All files recursively |
| `client/src/pages/Dashboard/` | modify all | All files recursively |
| `client/src/components/form/` | modify all | Shared form input components |
| `client/src/pages/SignIn/` | modify all | Login page |
| `client/src/pages/App/` | modify all | Root app shell |

### Do NOT Modify

- `client/src/pages/Licensees/` — owned by phase-2/task-04
- `client/src/pages/Messages/`, `client/src/pages/Contacts/`, `client/src/pages/Reports/` — owned by phase-2/task-05
- `client/src/services/*` — Phase 1 ownership (complete)
- `client/src/contexts/*` — owned by phase-2/task-03

## Implementation Steps

### Step 1: Type shared form components

Type props for all components in `client/src/components/form/` first — these are consumed by page components.

### Step 2: Type each page domain

For Templates, Triggers, Users, Dashboard: type props, `useState`, Formik form values, and event handlers per the pattern established in task-04.

### Step 3: Type SignIn and App shell

Type the login form values and the App shell props/routing state.

### Step 4: Typecheck

`cd client && npx tsc --noEmit`. Fix only owned files.

## Testing

- [ ] `cd client && npx tsc --noEmit` passes
- [ ] `NODE_ENV=test npx jest --testPathPattern="client/src/pages/(Templates|Triggers|Users|Dashboard|SignIn|App)" --no-coverage` — all pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] Run `document-solution` if the Formik generic pattern warrants documenting for future reference

## Completion Criteria

- [ ] All Template, Trigger, User, Dashboard page components typed
- [ ] Shared form components typed
- [ ] SignIn and App shell typed
- [ ] All relevant tests pass
- [ ] `cd client && npx tsc --noEmit` clean across the entire client
- [ ] Status updated in `status.md`
- [ ] Changes committed to `plan/type-client/phase-2/task-06-template-trigger-user-pages`
