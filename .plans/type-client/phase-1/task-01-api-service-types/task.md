# Task: API Base & Shared Interfaces

**Plan**: Client Type Narrowing
**Phase**: 1
**Task ID (phase-local)**: task-01
**Task Path**: phase-1/task-01-api-service-types
**Depends On**: None
**JIRA**: N/A

## Objective

Create `client/src/types/` with shared entity interfaces (ILicensee, IContact, IMessage, etc. as seen from the client), and type the base `api.ts` axios wrapper and `auth.ts` service.

## Context

The client defines its own interfaces for the shapes it receives from the backend REST API — these are independent from `src/types/` on the backend. They live in `client/src/types/`.

`client/src/services/api.ts` wraps axios with base URL and auth headers. `client/src/services/auth.ts` handles login/logout. Typing these first gives all other service files a typed base to build on.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Read `client/src/services/api.ts` and `client/src/services/auth.ts` fully
- [ ] Read several existing service files (licensee.ts, message.ts) to understand what shapes the API returns
- [ ] Check this task's `status.md` and mark `in-progress` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/types/index.ts` | create | Central barrel for client interfaces |
| `client/src/types/licensee.ts` | create | `ILicensee` client interface |
| `client/src/types/contact.ts` | create | `IContact` client interface |
| `client/src/types/message.ts` | create | `IMessage` client interface |
| `client/src/types/user.ts` | create | `IUser` client interface |
| `client/src/types/template.ts` | create | `ITemplate` client interface |
| `client/src/types/trigger.ts` | create | `ITrigger` client interface |
| `client/src/types/pagination.ts` | create | `IPaginatedResponse<T>` generic wrapper |
| `client/src/services/api.ts` | modify | Type axios instance and request helpers |
| `client/src/services/auth.ts` | modify | Type login/logout params and returns |

### Do NOT Modify

- `client/src/services/licensee.ts`, `client/src/services/contact.ts`, etc. — owned by phase-1/task-02
- `client/src/contexts/*` — owned by phase-2/task-03
- `client/src/pages/*` — Phase 2 ownership
- `client/src/components/*` — Phase 2 ownership

## Implementation Steps

### Step 1: Create `client/src/types/`

Create each interface file by reading the backend API response shapes from the existing service calls. The interfaces should match what `axios.get('/resources/licensees')` actually returns — not what the Mongoose model looks like internally.

### Step 2: Create `IPaginatedResponse<T>`

Many list endpoints return `{ data: T[], total: number, page: number }` or similar. Define a generic wrapper.

### Step 3: Type api.ts

Replace `any` on axios response types with generics: `api.get<T>(url)` returning `Promise<T>`.

### Step 4: Type auth.ts

Type `login(email: string, password: string): Promise<{ token: string }>` and `logout(): Promise<void>`.

### Step 5: Typecheck

`cd client && npx tsc --noEmit`. Fix only owned files.

## Testing

- [ ] `cd client && npx tsc --noEmit` passes
- [ ] `NODE_ENV=test npx jest --testPathPattern="client/src/services/(api|auth)" --no-coverage` — all pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB/doc updates required

## Completion Criteria

- [ ] `client/src/types/` created with entity interfaces
- [ ] `api.ts` and `auth.ts` typed
- [ ] `cd client && npx tsc --noEmit` clean
- [ ] Status updated in `status.md`
- [ ] Changes committed to `plan/type-client/phase-1/task-01-api-service-types`

## Conflict Avoidance Notes

- Task-02 runs in parallel — only append to `client/src/types/index.ts`, do not overwrite task-01 exports.
