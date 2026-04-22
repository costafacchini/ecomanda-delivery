# Vite ESM SPA Paths In Express

**Last Updated**: 2026-04-22
**Context**: Production throws `ReferenceError: __dirname is not defined` in `src/config/routes.js`, Express SPA fallback breaks after migrating the frontend from CRA to Vite, server still points at `client/build`

## Symptom

Production requests that fall through to the SPA catch-all route fail with:

```text
ReferenceError: __dirname is not defined
```

After fixing that, the app is still at risk of serving the wrong frontend artifact if Express is left pointing at CRA's old `client/build` directory instead of Vite's `client/dist`.

## Root Cause

`src/config/routes.js` was still written as if it were CommonJS and used `__dirname` inside an ES module.

At the same time, both `src/config/routes.js` and `src/config/http.js` were still targeting the pre-Vite frontend output directory (`client/build`). After the Vite migration, the real production artifact lives in `client/dist`.

## Fix

- Add a shared config module, `src/config/frontend-paths.js`, that resolves the frontend paths from `process.cwd()`
- Update `src/config/http.js` to serve static assets from `frontendDistDir`
- Update `src/config/routes.js` to send `frontendIndexFile` for the SPA catch-all route

Using `process.cwd()` avoids `import.meta`/`__dirname` differences and keeps the server and tests aligned with the application root.

## Regression Test

`src/config/routes.spec.js` mocks the route modules and asserts that the catch-all route sends `client/dist/index.html`.

## Prevention

- When converting server files to ESM, replace CommonJS path globals deliberately; do not leave bare `__dirname` references behind.
- After frontend build-tool migrations, update every server-side static path and SPA fallback path together.
- Prefer a single shared constant/module for frontend artifact locations so `express.static()` and `res.sendFile()` cannot drift apart.

## Related

- `docs/kb/integrations/cra-to-vite-migration.md`
- `docs/kb/bugfixes/heroku-vite-build-tool-missing.md`
