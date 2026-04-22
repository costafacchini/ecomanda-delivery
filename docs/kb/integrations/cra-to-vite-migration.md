# CRA to Vite Migration

**Last Updated**: 2026-04-21
**Context**: When migrating from `react-scripts` (CRA) to Vite/Vitest, or debugging JSX parse errors / mock failures in Vitest on a `.js`-extension codebase.

## Overview

This codebase's `client/` was migrated from CRA (`react-scripts 5.0.1`) to Vite 6 + Vitest 3 in April 2026. Three non-obvious issues surfaced that don't appear in standard Vite/Vitest guides.

---

## Issue 1: JSX in `.js` files (not `.jsx`)

### Problem
All source and test files use `.js` extension even when they contain JSX. Vite's `vite:import-analysis` plugin fails with:

```
Error: Failed to parse source for import analysis because the content contains
invalid JS syntax. If you are using JSX, make sure to name the file with the
.jsx or .tsx extension.
```

`@vitejs/plugin-react`'s `include` option (e.g. `include: /\.(js|jsx)$/`) is **not enough** — Vitest's internal SSR transform pipeline runs `vite:import-analysis` before the React Babel plugin can process `.js` files.

### Fix
Configure esbuild at the root level to parse all source `.js` and `.ts` files as JSX:

```js
// client/vite.config.js
esbuild: {
  loader: 'jsx',
  include: /src\/.*\.[jt]sx?$/,
  exclude: [],
},
optimizeDeps: {
  esbuildOptions: {
    loader: { '.js': 'jsx' },
  },
},
```

This makes esbuild handle JSX in `.js` files _before_ `vite:import-analysis` sees them, regardless of which transform pipeline Vitest uses internally.

---

## Issue 2: `jest.mock()` hoisting requires `vi.mock()`

### Problem
Vitest statically hoists `vi.mock()` calls to the top of the file (so mocks are in place before imports run). It does **not** hoist `jest.mock()`, even if `global.jest = vi` is set in setup. The result:

```
TypeError: getLicensees.mockResolvedValue is not a function
```

because the module was imported as the real module before the runtime `jest.mock()` ran.

### Fix
Rename all `jest.mock(`, `jest.fn(`, `jest.spyOn(`, `jest.clearAllMocks(` → `vi.*` in spec files:

```bash
find client/src -name "*.spec.js" -exec sed -i '' 's/jest\./vi\./g' {} \;
```

> **Note**: Setting `global.jest = vi` in `setupTests.js` is **not** a valid workaround for `jest.mock()` because hoisting is a compile-time transform, not a runtime aliasing.

---

## Issue 3: Mock call counts accumulate between tests (`clearMocks`)

### Problem
CRA's Jest config ships with `clearMocks: true` by default. Vitest does not. Without it, mock call history (`.mock.calls`) accumulates across all tests in a file. Tests using `toHaveBeenNthCalledWith(2, …)` fail because the "2nd call" refers to a call from a _previous_ test, not the current one.

### Fix
Add to `vite.config.js` test block:

```js
test: {
  clearMocks: true,   // equivalent to CRA's default jest clearMocks: true
  // ...
}
```

> **Note**: `clearMocks` only clears call history (`.mockClear()`), not implementations. Use `resetMocks` if you also need to wipe `mockResolvedValue` etc. between tests.

---

## Final `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  server: {
    proxy: {
      '/resources': 'http://localhost:5001',
      '/login': 'http://localhost:5001',
    },
  },
  css: {
    modules: { localsConvention: 'camelCase' },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
    clearMocks: true,
    coverage: { provider: 'v8' },
  },
})
```

---

## Common Pitfalls

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| JSX in `.js` files | `vite:import-analysis` parse error | `esbuild.include` + `esbuild.loader: 'jsx'` |
| `jest.mock()` not hoisted | `mockResolvedValue is not a function` | Rename to `vi.mock()` (batch sed) |
| Call counts bleed between tests | `toHaveBeenNthCalledWith(N)` finds wrong call | Add `clearMocks: true` to vitest config |
| CRA `eslintConfig` removed | ESLint finds no config | Add a proper `.eslintrc` or `eslint.config.js` |

## Related

- `client/vite.config.js` — live config
- `client/src/setupTests.js` — test setup (jest-dom, polyfills)
- [bl-v7-bufferliststream-upgrade](bl-v7-bufferliststream-upgrade.md) — another toolchain migration doc
