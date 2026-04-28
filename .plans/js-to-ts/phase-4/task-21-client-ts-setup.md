# Task: Add client TS deps and create client/tsconfig.json

**Plan**: JS to TypeScript Migration
**Phase**: 4
**Task Path**: phase-4/task-21-client-ts-setup
**Depends On**: phase-0/task-00-verify-cra-to-vite-complete, phase-1/task-01-backend-ts-deps
**JIRA**: N/A

## Objective

Install client-side TypeScript dependencies and create `client/tsconfig.json` with `allowJs: true`, `strict: false`, `jsx: react-jsx` settings. Update `vite.config.js` to handle `.tsx` files.

## Context

The client runs on Vite (cra-to-vite is complete). TypeScript deps needed: `typescript`, `@types/react`, `@types/react-dom`. The client tsconfig is separate from the root tsconfig. Vitest handles TS natively — no additional Jest/Babel transform needed.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/package.json` | modify | Add typescript, @types/react, @types/react-dom |
| `client/tsconfig.json` | create | Client tsconfig |
| `client/vite.config.js` | modify | Ensure .tsx is handled |

## Implementation Steps

### Step 1: Install client TS deps
`yarn workspace client add --dev typescript @types/react @types/react-dom`

### Step 2: Create client/tsconfig.json
`compilerOptions`: `allowJs: true`, `checkJs: false`, `strict: false`, `jsx: "react-jsx"`, `esModuleInterop: true`, `moduleResolution: "bundler"` (Vite-compatible), `noEmit: true`.

### Step 3: Verify vite config
Confirm `vite.config.js` already resolves `.tsx` — Vite does this by default. Add `.tsx` to `resolve.extensions` explicitly if not present.

### Step 4: Run client build and tests
`vitest run` and `vite build` must pass.

## Testing

- [ ] `vitest run` passes
- [ ] `vite build` succeeds
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] `client/tsconfig.json` exists
- [ ] Client TS deps installed
- [ ] `vitest run` still passes
- [ ] Changes committed to `plan/js-to-ts/phase-4/task-21-client-ts-setup` branch
- [ ] Status updated in `status.md`
