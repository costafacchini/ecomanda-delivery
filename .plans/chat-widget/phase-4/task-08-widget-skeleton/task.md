# Task: Widget Project Skeleton (Vite IIFE Build)

**Plan**: Chat Widget
**Phase**: 4
**Task ID (phase-local)**: task-08
**Task Path**: phase-4/task-08-widget-skeleton
**Depends On**: phase-3/task-06-widget-router
**JIRA**: N/A

## Objective

Create the `widget/` top-level directory with its own `package.json`, `tsconfig.json`, and `vite.config.ts` configured to output a single IIFE bundle (`widget.js`). The bundle must be self-contained — no external script dependencies assumed on the host page.

## Context

The widget is a separate React app from the main `client/`. It has its own build pipeline producing `widget/dist/widget.js`. The IIFE format wraps the bundle in an immediately-invoked function expression, avoiding global scope pollution beyond a single `window.EcomandaWidget` namespace.

**Key Vite settings**:
- `build.lib.entry`: `widget/src/main.tsx`
- `build.lib.formats`: `['iife']`
- `build.lib.name`: `'EcomandaWidget'`
- `build.lib.fileName`: `() => 'widget.js'`
- CSS must be injected into Shadow DOM (handled in task-10) or inlined — configure `build.cssCodeSplit: false`

**Dependencies needed** (look up current versions before installing):
- `react`, `react-dom` — mark as `devDependencies` since they'll be bundled (not external)
- `vite`, `@vitejs/plugin-react`
- `typescript`

The widget source lives in `widget/src/`. The React entry point is `widget/src/main.tsx`.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-3/task-06-widget-router` status is `complete`
- [ ] Check current React and Vite versions used in `client/package.json` — use matching or newer
- [ ] Run `npm show react version`, `npm show vite version` to verify latest
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `widget/package.json` | create | Project manifest + build script |
| `widget/tsconfig.json` | create | TypeScript config |
| `widget/vite.config.ts` | create | IIFE lib build config |
| `widget/src/main.tsx` | create | Entry point placeholder (renders "Widget loaded") |
| `widget/.gitignore` | create | Ignore dist/ and node_modules/ |

### Do NOT Modify

- `client/` — separate SPA, no changes
- `package.json` (root) — widget has its own package.json

## Implementation Steps

### Step 1: Create widget/package.json

```json
{
  "name": "ecomanda-widget",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "build": "vite build",
    "dev": "vite build --watch"
  },
  "dependencies": {
    "react": "<latest>",
    "react-dom": "<latest>"
  },
  "devDependencies": {
    "@types/react": "<latest>",
    "@types/react-dom": "<latest>",
    "@vitejs/plugin-react": "<latest>",
    "typescript": "<latest>",
    "vite": "<latest>"
  }
}
```

Replace `<latest>` with actual versions resolved at task time via `npm show <pkg> version`.

### Step 2: Create widget/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["ES2017", "DOM"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

### Step 3: Create widget/vite.config.ts

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.tsx'),
      name: 'EcomandaWidget',
      formats: ['iife'],
      fileName: () => 'widget.js',
    },
    cssCodeSplit: false,
    rollupOptions: {
      // React is bundled — no externals
    },
  },
})
```

### Step 4: Create widget/src/main.tsx placeholder

```tsx
console.log('[EcomandaWidget] loaded')
```

This will be replaced in task-09 and task-10.

### Step 5: Create widget/.gitignore

```
dist/
node_modules/
```

### Step 6: Install dependencies

```bash
cd widget && yarn install
```

### Step 7: Verify build

```bash
cd widget && yarn build
```

Confirm `widget/dist/widget.js` is produced and is a single IIFE file.

## Testing

- [ ] `yarn build` in `widget/` produces `widget/dist/widget.js`
- [ ] File is a single IIFE (not ESM)
- [ ] `yarn typecheck` passes (root backend typecheck unaffected)

## Documentation / KB Updates

No KB/doc updates required for skeleton alone.

## Completion Criteria

- [ ] `widget/dist/widget.js` produced by `yarn build`
- [ ] No TypeScript errors in widget/src
- [ ] Status updated to `complete` in `status.md`

## Conflict Avoidance Notes

- task-09, task-10, task-11 all depend on this task completing first.
