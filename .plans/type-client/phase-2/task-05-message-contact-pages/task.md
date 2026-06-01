# Task: Message & Contact Page Types

**Plan**: Client Type Narrowing
**Phase**: 2
**Task ID (phase-local)**: task-05
**Task Path**: phase-2/task-05-message-contact-pages
**Depends On**: phase-1/task-02-entity-services
**JIRA**: N/A

## Objective

Type all components in `client/src/pages/Messages/`, `client/src/pages/Contacts/`, `client/src/pages/Reports/`, and the `SelectContactsWithFilter` shared component.

## Context

Messages and Contacts are the two most active data domains in the UI. The Reports page (`client/src/pages/Reports/Message/`) shows filtered message history with date range params — 9 `any` occurrences.

The `SelectContactsWithFilter` component in `client/src/components/` is contact-specific and should be typed in this task.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-1/task-02-entity-services` is `complete`
- [ ] `ls -R client/src/pages/Messages/ client/src/pages/Contacts/ client/src/pages/Reports/` to see all files
- [ ] Check this task's `status.md` and mark `in-progress` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Messages/` | modify all | All files recursively |
| `client/src/pages/Contacts/` | modify all | All files recursively |
| `client/src/pages/Reports/` | modify all | All files recursively |
| `client/src/components/SelectContactsWithFilter/` | modify all | Shared contact selector component |

### Do NOT Modify

- `client/src/pages/Licensees/` — owned by phase-2/task-04
- `client/src/pages/Templates/`, `client/src/pages/Triggers/`, `client/src/pages/Users/` — owned by phase-2/task-06
- `client/src/services/*` — Phase 1 ownership (complete)

## Implementation Steps

### Step 1: Type component props

For each page component and scene, define prop interfaces using `IMessage`, `IContact` from `client/src/types/`.

### Step 2: Type state and handlers

Replace `useState<any>`, `useState([])`, etc. with typed versions. Type filter state objects.

### Step 3: Type SelectContactsWithFilter

Type `onChange`, `value` (IContact | null), and filter params.

### Step 4: Type date range and filter params in Reports

Define a `IMessageReportFilters` interface for the date range and licensee filter state.

### Step 5: Typecheck

`cd client && npx tsc --noEmit`. Fix only owned files.

## Testing

- [ ] `cd client && npx tsc --noEmit` passes
- [ ] `NODE_ENV=test npx jest --testPathPattern="client/src/pages/(Messages|Contacts|Reports)" --no-coverage` — all pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB/doc updates required

## Completion Criteria

- [ ] All Message, Contact, and Report page components typed
- [ ] `SelectContactsWithFilter` typed
- [ ] All relevant tests pass
- [ ] Status updated in `status.md`
- [ ] Changes committed to `plan/type-client/phase-2/task-05-message-contact-pages`
