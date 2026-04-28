# Vite 8 JSX-in-JS Test Failures

**Last Updated**: 2026-04-28
**Context**: Client Vitest suites fail after upgrading to Vite 8 with `Unexpected JSX expression`, `JSX syntax is disabled`, or `Failed to parse source for import analysis` in `.js` files under `client/src`

## Symptom

After bumping `client/vite` to 8.x, `cd client && yarn test` fails before most specs execute. Typical errors include:

```text
RolldownError: Parse failure: Unexpected JSX expression
Error: Failed to parse source for import analysis because the content contains invalid JS syntax.
Error: JSX syntax is disabled and should be enabled via the parser options
```

In this repo, the failures show up across `.spec.js` files and app modules because `client/src/` still uses `.js` files that contain JSX.

## Root Cause

The Vite 6-era workaround in `client/vite.config.js` used the root `esbuild` option to treat `client/src/**/*.js` as JSX before Vitest import analysis ran.

After the Vite 8 upgrade, Vite switched JS transforms to Oxc. The React plugin now contributes `oxc` config internally, so the repo's custom `esbuild` JSX override is ignored. Vite prints the relevant warning during tests:

```text
Both esbuild and oxc options were set. oxc options will be used and esbuild options will be ignored.
```

A direct `oxc.include` replacement is not enough in this repo. Even when Oxc matches `client/src/**/*.js`, it still parses `.js` files as plain JS unless the transform explicitly sets `lang: 'jsx'`.

## Fix

Add a pre-transform plugin in `client/vite.config.js` that rewrites `client/src/**/*.js` with `transformWithOxc(..., { lang: 'jsx', jsx: { runtime: 'automatic' } })` before the normal Vite/Vitest parser pipeline runs.

The old root-level `esbuild` workaround can be removed entirely for this repo's source transforms on Vite 8.

## Verification

Run the client test suite:

```bash
cd client && yarn test
```

Expected result on this repo after the fix:

```text
Test Files  30 passed (30)
Tests  122 passed (122)
```

## Prevention

- If the client still stores JSX in `.js` files, keep a dedicated pre-transform step for `client/src/**/*.js` when upgrading Vite.
- Do not assume the old CRA-to-Vite `esbuild.loader = 'jsx'` workaround still applies after the Vite 8 Oxc migration.
- If this repo later renames JSX-bearing files to `.jsx`, this compatibility plugin can likely be removed.

## Related

- `client/vite.config.js`
- `docs/kb/integrations/cra-to-vite-migration.md`
