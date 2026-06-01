# Task: Entity Service Types

**Plan**: Client Type Narrowing
**Phase**: 1
**Task ID (phase-local)**: task-02
**Task Path**: phase-1/task-02-entity-services
**Depends On**: None
**JIRA**: N/A

## Objective

Type all entity service files in `client/src/services/` — licensee, contact, message, template, trigger, user, dashboard — replacing `any` in function parameters and return types with the interfaces defined in task-01.

## Context

Service files make API calls and return data to page components. They have the highest concentration of `any` in the client (218 total). The pattern per service function is: typed params → typed axios call using `api.get<IEntity[]>()` → typed return value.

This task runs in parallel with task-01 — if task-01 is not yet merged, use the same interfaces locally (they'll be the same shape) and import from task-01's branch or stub temporarily.

Files: all `*.ts` in `client/src/services/` except `api.ts` and `auth.ts`.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify task-01 is `complete` or get interfaces from its branch
- [ ] Read `client/src/services/licensee.ts` as a representative sample before starting others
- [ ] Check this task's `status.md` and mark `in-progress` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/services/licensee.ts` | modify | Type all CRUD functions |
| `client/src/services/contact.ts` | modify | Type all CRUD functions |
| `client/src/services/message.ts` | modify | Type message list/send functions |
| `client/src/services/template.ts` | modify | Type template CRUD functions |
| `client/src/services/trigger.ts` | modify | Type trigger CRUD functions |
| `client/src/services/user.ts` | modify | Type user CRUD functions |
| `client/src/services/dashboard.ts` | modify | Type dashboard metric functions |
| `client/src/services/objectToQueryParameter.ts` | modify | Type the query builder utility |

### Do NOT Modify

- `client/src/services/api.ts`, `client/src/services/auth.ts` — owned by phase-1/task-01
- `client/src/pages/*`, `client/src/contexts/*` — Phase 2 ownership

## Implementation Steps

### Step 1: Type each service function

For each service file, replace `any` params and return types:
```ts
// Before
export const getLicensees = async (params: any): Promise<any> => { ... }

// After
export const getLicensees = async (params: ILicenseeFilters): Promise<IPaginatedResponse<ILicensee>> => { ... }
```

Define filter/param interfaces inline in each service file if they are not generic enough to share.

### Step 2: Type objectToQueryParameter

This utility converts an object to a query string. Type its input as `Record<string, string | number | boolean | undefined>` and return as `string`.

### Step 3: Typecheck

`cd client && npx tsc --noEmit`. Fix only owned files.

## Testing

- [ ] `cd client && npx tsc --noEmit` passes
- [ ] `NODE_ENV=test npx jest --testPathPattern="client/src/services/(licensee|contact|message|template|trigger|user)" --no-coverage` — all pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB/doc updates required

## Completion Criteria

- [ ] All entity service functions have typed params and return types
- [ ] All service tests pass
- [ ] Status updated in `status.md`
- [ ] Changes committed to `plan/type-client/phase-1/task-02-entity-services`
