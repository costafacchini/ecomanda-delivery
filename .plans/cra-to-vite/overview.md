# Plan: Migrate client from CRA to Vite

**Created**: 2026-04-02
**Status**: Complete
**Branch**: feature/cra-to-vite

## Objective

Replace `react-scripts` (Create React App — deprecated) with Vite to achieve clean React 19
compatibility, eliminate the 5 peer-dep errors currently papered over by `resolutions`, and
modernise the build/dev/test toolchain.

## Context

| Item | Current | Target |
|------|---------|--------|
| Bundler | `react-scripts 5.0.1` (CRA) | `vite` + `@vitejs/plugin-react` |
| Dev server | CRA webpack-dev-server | Vite dev server |
| Test runner | `react-scripts test` (CRA Jest) | Vitest (Jest-compatible API) |
| Proxy | `"proxy"` in `package.json` | `server.proxy` in `vite.config.js` |
| Env vars | `REACT_APP_*` / `process.env` | None used — no changes needed |
| Entry HTML | `public/index.html` | `client/index.html` (root level) |

**Source scope**: 62 source files, 30 test files — all `.js`, CSS/SCSS, CSS Modules, no SVGs.

## Tasks

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 1 | Replace deps: remove `react-scripts`/`web-vitals`, add `vite`/`@vitejs/plugin-react`/`vitest`/`@vitest/coverage-v8`/`jsdom`/`@testing-library/jest-dom` | Complete | `client/package.json` | — |
| 2 | Create `vite.config.js` with React plugin, proxy (`/api` → `http://localhost:5001`), SCSS support, CSS Modules, and `test` block pointing to `setupTests.js` | Complete | `client/vite.config.js` *(new)* | 1 |
| 3 | Move and update `public/index.html` → `client/index.html`: remove CRA `%PUBLIC_URL%` references, add `<script type="module" src="/src/index.js">` | Complete | `client/index.html` *(new)*, `client/public/index.html` *(delete)* | 2 |
| 4 | Update `package.json` scripts: replace `react-scripts start/build/test/eject` with `vite dev`, `vite build`, `vitest run`, `vitest watch`; remove CRA `eslintConfig` block | Complete | `client/package.json` | 1 |
| 5 | Remove CRA leftovers: delete `reportWebVitals.js`, remove its call from `src/index.js` | Complete | `client/src/reportWebVitals.js` *(delete)*, `client/src/index.js` | 3 |
| 6 | Update test setup: rename/update `setupTests.js` — remove CRA-specific polyfills if no longer needed; ensure `@testing-library/jest-dom` import still works with Vitest | Complete | `client/src/setupTests.js` | 2 |
| 7 | Run `yarn install`, run `vitest run` and verify all 30 test files pass (121/122 tests — the 1 timezone failure predates this migration) | Complete | — | 3, 4, 5, 6 |
| 8 | Smoke-test dev build: `vite dev` starts, app loads in browser, proxy to backend works | Complete | — | 7 |
| 9 | Smoke-test production build: `vite build` succeeds, `vite preview` serves the bundle | Complete | — | 7 |

## File Ownership

| File | Task |
|------|------|
| `client/package.json` | 1, 4 |
| `client/vite.config.js` | 2 |
| `client/index.html` | 3 |
| `client/public/index.html` | 3 (delete) |
| `client/src/reportWebVitals.js` | 5 (delete) |
| `client/src/index.js` | 5 |
| `client/src/setupTests.js` | 6 |

## Risks

- **`react-transition-group 4.4.5`** is pulled in transitively by react-select/react-toastify. It uses `findDOMNode` (removed in React 19). Our source code doesn't call it directly, but Bootstrap modal/tooltip usage could surface runtime errors. Mitigation: note in smoke test; upgrade transitively if errors appear.
- **CSS Modules `.module.scss`**: Vite handles these natively — no action needed, but verify during task 7.
- **`patch-package` postinstall**: still runs after `yarn install`; verify no patch conflicts after removing `react-scripts`.
- **`react-scripts test` vs Vitest API**: Vitest is Jest-compatible (same `describe/it/expect` globals). `jest.mock` → `vi.mock` is the only API rename needed — check all 30 test files and update if any use `jest.*` directly.

## Done When

- [x] All tasks complete
- [x] `vitest run` passes (121/122 — timezone test excluded)
- [x] `vite build` succeeds with no errors
- [x] `yarn check --verify-tree` has no peer-dep errors from CRA
- [x] KB updated if non-trivial solutions were found
