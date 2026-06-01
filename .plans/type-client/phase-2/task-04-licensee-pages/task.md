# Task: Licensee Page Types

**Plan**: Client Type Narrowing
**Phase**: 2
**Task ID (phase-local)**: task-04
**Task Path**: phase-2/task-04-licensee-pages
**Depends On**: phase-1/task-02-entity-services
**JIRA**: N/A

## Objective

Type all components in `client/src/pages/Licensees/` and the `SelectLicenseesWithFilter` shared component, replacing `any` in props, state, Formik fields, and event handlers.

## Context

The Licensee pages have the highest `any` count in the client (17 occurrences in `LicenseeWizard.tsx` alone). The wizard is multi-step with complex Formik integration. Use Formik's built-in generics (`useFormik<ILicenseeFormValues>`) rather than trying to replace Formik's internal types.

The `SelectLicenseesWithFilter` component in `client/src/components/` is also licensee-specific and should be typed in this task.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-1/task-02-entity-services` is `complete`
- [ ] `ls -R client/src/pages/Licensees/` to see all files
- [ ] Read `client/src/pages/Licensees/scenes/New/LicenseeWizard.tsx` (most complex file) before starting
- [ ] Check this task's `status.md` and mark `in-progress` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Licensees/` | modify all | All files recursively |
| `client/src/components/SelectLicenseesWithFilter/` | modify all | Shared licensee selector component |

### Do NOT Modify

- `client/src/pages/Messages/`, `client/src/pages/Contacts/` — owned by phase-2/task-05
- `client/src/pages/Templates/`, `client/src/pages/Triggers/`, `client/src/pages/Users/` — owned by phase-2/task-06
- `client/src/services/*` — Phase 1 ownership (complete)

## Implementation Steps

### Step 1: Define form value interfaces

For the Licensee wizard and edit form, define `ILicenseeFormValues` with all form field types. Use this with Formik: `useFormik<ILicenseeFormValues>`.

### Step 2: Type component props

Replace `(props: any)` with typed prop interfaces for each component and scene.

### Step 3: Type useState and event handlers

Replace `useState<any>` with typed versions. Type onChange/onSubmit event handlers using `React.ChangeEvent<HTMLInputElement>` etc.

### Step 4: Type SelectLicenseesWithFilter

Type the `onChange`, `value`, and `options` props. The selected value is `ILicensee | null`.

### Step 5: Typecheck

`cd client && npx tsc --noEmit`. Fix only owned files.

## Testing

- [ ] `cd client && npx tsc --noEmit` passes
- [ ] `NODE_ENV=test npx jest --testPathPattern="client/src/pages/Licensees" --no-coverage` — all pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB/doc updates required

## Completion Criteria

- [ ] All Licensee page components have typed props and state
- [ ] Formik usage typed with `ILicenseeFormValues`
- [ ] `SelectLicenseesWithFilter` typed
- [ ] All relevant tests pass
- [ ] Status updated in `status.md`
- [ ] Changes committed to `plan/type-client/phase-2/task-04-licensee-pages`
