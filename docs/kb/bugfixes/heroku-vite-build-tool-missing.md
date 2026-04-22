# Heroku Vite Build Tool Missing

**Last Updated**: 2026-04-22
**Context**: Heroku deploy fails with `vite: not found`, frontend build breaks only in production install mode, nested `client/` install on Heroku after the CRA to Vite migration

## Symptom

Heroku finishes the root dependency install, enters the app build step, then fails inside `client/` with:

```text
$ vite build
/bin/sh: 1: vite: not found
```

## Root Cause

The root build script in `package.json:12` installs `client/` dependencies during the Heroku build. Before the fix, that command was `cd client && yarn && yarn run build`.

Heroku's Node buildpack runs builds with `NODE_ENV=production`, so the nested Yarn install in `client/` omitted `devDependencies`. That pruned the build tooling declared in `client/package.json:46-53`, including `vite`, even though the build command in `client/package.json:29` requires it.

## Fix

Change the root build script at `package.json:12` to:

```text
cd client && yarn install --production=false && yarn run build
```

That keeps the frontend build-time dependencies available during slug compilation while still producing the same runtime artifact.

## Verification

Run the Heroku-equivalent build path locally:

```bash
NODE_ENV=production yarn build
```

The command now completes successfully and `vite build` runs as expected.

## Prevention

- Keep Vite and Vitest in `client/devDependencies`; they are build-time tools, not runtime dependencies.
- If a deployment pipeline performs a separate install inside `client/`, explicitly disable production pruning for that install step or the Vite binary will disappear again.
- Re-check this path after changing Heroku build scripts, package manager behavior, or frontend dependency layout.

## Related

- `docs/kb/integrations/cra-to-vite-migration.md`
