# Task: Context Types

**Plan**: Client Type Narrowing
**Phase**: 2
**Task ID (phase-local)**: task-03
**Task Path**: phase-2/task-03-context-types
**Depends On**: phase-1/task-01-api-service-types
**JIRA**: N/A

## Objective

Type all React contexts in `client/src/contexts/`, replacing `createContext<any>(null)` with properly typed context values and provider props.

## Context

React contexts currently use `createContext<any>(null)` which defeats the purpose of TypeScript. The pattern to use:

```ts
interface IAuthContext {
  user: IUser | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<IAuthContext | null>(null)

// Custom hook with null guard:
export function useAuth(): IAuthContext {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-1/task-01-api-service-types` is `complete`
- [ ] `ls client/src/contexts/` to see all context files
- [ ] Read each context file before making changes
- [ ] Check this task's `status.md` and mark `in-progress` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/contexts/*.tsx` | modify all | All context files |

### Do NOT Modify

- `client/src/services/*` — Phase 1 ownership (complete)
- `client/src/pages/*` — other Phase 2 tasks
- `client/src/components/*` — other Phase 2 tasks

## Implementation Steps

### Step 1: Define context value interfaces

For each context, define the interface for its value object. Import entity interfaces from `client/src/types/` as needed.

### Step 2: Apply typed createContext

Replace `createContext<any>(null)` with `createContext<IContextValue | null>(null)`.

### Step 3: Add typed custom hooks

Ensure each context has a typed custom hook (e.g., `useAuth()`) with a null guard.

### Step 4: Type provider props and state

Replace `any` in useState, useReducer, and event handlers within each provider component.

### Step 5: Typecheck

`cd client && npx tsc --noEmit`. Fix only owned files.

## Testing

- [ ] `cd client && npx tsc --noEmit` passes
- [ ] `NODE_ENV=test npx jest --testPathPattern="client/src" --no-coverage` — all pass (contexts affect the whole app)
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB/doc updates required

## Completion Criteria

- [ ] All contexts have typed value interfaces
- [ ] No `createContext<any>` remaining
- [ ] Custom context hooks are typed with null guards
- [ ] All client tests pass
- [ ] Status updated in `status.md`
- [ ] Changes committed to `plan/type-client/phase-2/task-03-context-types`
