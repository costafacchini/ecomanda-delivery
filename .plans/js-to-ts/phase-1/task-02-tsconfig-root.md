# Task: Create root tsconfig.json

**Plan**: JS to TypeScript Migration
**Phase**: 1
**Task Path**: phase-1/task-02-tsconfig-root
**Depends On**: phase-1/task-01-backend-ts-deps
**JIRA**: N/A

## Objective

Create a root-level `tsconfig.json` configured for incremental migration: `allowJs: true`, `checkJs: false`, `strict: false`, `noImplicitAny: false`, `module: CommonJS`, `moduleResolution: node`, with path aliases matching all runtime and test aliases (`_moduleAliases` in `package.json` plus `@factories` from `jest.config.mjs`).

## Context

The backend uses CommonJS (`require`/`module.exports`) — `module` must be `CommonJS`, not `NodeNext` (NodeNext requires ESM syntax and would immediately break all existing files). `moduleResolution: node` matches how Node resolves modules at runtime.

The tsconfig `paths` must cover **both** sources of aliases:
- `_moduleAliases` in `package.json` (runtime resolution via `module-alias`)
- `moduleNameMapper` entries in `jest.config.mjs` (test resolution)

`@factories` is present in jest's mapper but absent from `_moduleAliases` — include it in `paths` or TS will error on any `.ts` file that imports `@factories`.

`outDir: dist` is set but `tsc --noEmit` is used throughout the migration (no emit). `allowJs: true` lets TS process existing `.js` files without renaming them.

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify every prerequisite task in `Depends On` is complete
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `tsconfig.json` | create | Root backend tsconfig |

## Implementation Steps

### Step 1: Read package.json _moduleAliases
Identify all aliases to mirror in `paths`.

### Step 2: Create tsconfig.json
Set `compilerOptions`: `allowJs: true`, `checkJs: false`, `strict: false`, `noImplicitAny: false`, `esModuleInterop: true`, `module: "CommonJS"`, `moduleResolution: "node"`, `outDir: "dist"`, `rootDir: "."`, `paths` mirroring all `_moduleAliases` entries **plus** `@factories → ["./src/app/factories"]` (present in jest mapper but not in `_moduleAliases`).

### Step 3: Verify zero errors
Run `npx tsc --noEmit` — should report zero errors on the current JS-only codebase.

## Testing

- [ ] `npx tsc --noEmit` exits with code 0
- [ ] `pre-commit-check` passes

## Completion Criteria

- [ ] `tsconfig.json` exists at repo root
- [ ] `tsc --noEmit` passes on current JS codebase
- [ ] Changes committed to `plan/js-to-ts/phase-1/task-02-tsconfig-root` branch
- [ ] Status updated in `status.md`
