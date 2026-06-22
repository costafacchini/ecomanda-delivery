# Task: Express Static Serve widget.js

**Plan**: Chat Widget
**Phase**: 4
**Task ID (phase-local)**: task-11
**Task Path**: phase-4/task-11-express-static
**Depends On**: phase-4/task-10-widget-hooks-mount
**JIRA**: N/A

## Objective

Serve `widget/dist/widget.js` as a static file at `/widget.js` from the Express server, update the Heroku Procfile/build step to compile the widget on deploy, and document the embed snippet for licensees.

## Context

The Express app already serves the React SPA from `client/build` or `client/dist` via `express.static(frontendDistDir)`. The widget bundle needs an additional static serve pointing at `widget/dist/`.

`src/config/frontend-paths.ts` defines `frontendDistDir`. We'll add a widget equivalent and wire it in `src/config/http.ts`.

**Heroku build**: `package.json` (root) needs a `heroku-postbuild` (or `build`) script that runs `cd widget && yarn install && yarn build` after the main build.

**Embed snippet** (to show licensees):
```html
<script src="https://your-ecomanda-domain.com/widget.js" data-licensee="YOUR_API_TOKEN" async></script>
```

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-4/task-10-widget-hooks-mount` status is `complete`
- [ ] Verify `widget/dist/widget.js` exists after running `cd widget && yarn build`
- [ ] Read `src/config/frontend-paths.ts` — pattern for static path resolution
- [ ] Read `src/config/http.ts` — where `express.static` is called
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/config/frontend-paths.ts` | modify | Add `widgetDistDir` export |
| `src/config/http.ts` | modify | Add `express.static(widgetDistDir)` before SPA catch-all |
| `package.json` (root) | modify | Add widget build to postbuild/build script |
| `widget/.gitignore` | verify | Confirm `dist/` is ignored |

### Do NOT Modify

- `widget/src/` — owned by task-09 and task-10
- `src/config/routes.ts` — widget API routes already registered in task-06

## Implementation Steps

### Step 1: Update frontend-paths.ts

```ts
import path from 'path'

export const frontendDistDir = path.join(__dirname, '..', '..', 'client', 'dist')
export const widgetDistDir = path.join(__dirname, '..', '..', 'widget', 'dist')
```

(Adjust relative path depth based on actual file location — verify with `__dirname` at runtime.)

### Step 2: Serve widget static in http.ts

In `src/config/http.ts`, after the existing `app.use(express.static(frontendDistDir))` line:

```ts
import { frontendDistDir, widgetDistDir } from './frontend-paths'
// ...
app.use(express.static(frontendDistDir))
app.use(express.static(widgetDistDir))   // serves widget.js at /widget.js
```

The `/widget.js` path is served before the SPA catch-all route, so it won't be intercepted.

### Step 3: Add widget build to root package.json

In root `package.json`, find the `build` or `heroku-postbuild` script and add the widget step:

```json
"scripts": {
  "build": "tsc && cd client && yarn build && cd ../widget && yarn install --frozen-lockfile && yarn build",
  "heroku-postbuild": "cd client && yarn install && yarn build && cd ../widget && yarn install --frozen-lockfile && yarn build"
}
```

Verify what the existing build script looks like before modifying — match the pattern.

### Step 4: Add widget/dist to .gitignore

Confirm `widget/dist/` is in `widget/.gitignore`. The built artifact is not committed — it's built at deploy time.

### Step 5: Smoke test

```bash
# Start dev server
yarn dev:server
```

```bash
curl http://localhost:5001/widget.js | head -5
```

Confirm the response is JavaScript (not 404 or HTML).

Create a minimal `test.html`:
```html
<!DOCTYPE html>
<html>
<body>
  <h1>Widget test host page</h1>
  <script src="http://localhost:5001/widget.js" data-licensee="YOUR_TEST_API_TOKEN" async></script>
</body>
</html>
```

Open in browser and verify the widget floating button appears.

## Testing

- [ ] `curl /widget.js` returns JS content (not 404)
- [ ] Widget loads on a test HTML page opened from a different origin
- [ ] Existing SPA routes still work (no regression)
- [ ] `yarn build` (root) compiles both client and widget

## Documentation / KB Updates

- [ ] Run `document-solution` to create a KB doc: `docs/kb/features/chat-widget.md` covering the full architecture (Contact web type, 3 API endpoints, polling, IIFE bundle, Shadow DOM mount, embed snippet, web contact guard).
- [ ] Run `check-kb-index` after creating the KB doc

## Completion Criteria

- [ ] `GET /widget.js` returns the widget bundle
- [ ] Widget renders on external HTML page
- [ ] Heroku build script includes widget compilation step
- [ ] KB doc created for the chat widget feature
- [ ] Status updated to `complete` in `status.md`
