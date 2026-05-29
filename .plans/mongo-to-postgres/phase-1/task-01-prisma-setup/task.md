# Task: Install & configure Prisma + PostgreSQL

**Plan**: MongoDB → PostgreSQL Migration
**Phase**: 1
**Task ID (phase-local)**: task-01
**Task Path**: phase-1/task-01-prisma-setup
**Depends On**: None
**JIRA**: N/A

## Objective

Install Prisma ORM and the PostgreSQL client driver, wire a PostgreSQL connection alongside the existing MongoDB connection, create the initial empty `schema.prisma`, and update environment configuration and CI so the repo supports both databases simultaneously.

## Context

The application currently connects to MongoDB via `src/config/database.js` + `src/config/mongo.js` using the `mongoose` package. We need to add PostgreSQL support **without removing Mongoose** — both databases will run in parallel until Phase 4.

Relevant files:
- `src/config/database.js` — current connect(); will be extended
- `src/config/mongo.js` — MongoServer class
- `.env.example` — environment variable template
- `package.json` — add `prisma`, `@prisma/client`, `pg` deps
- `src/app.js` or server entry point — check if health-check endpoint exists

Architecture doc: `docs/kb/architecture/project-overview.md`

## Before You Start

- [ ] Switch to base branch and pull: `git switch main && git pull --rebase origin main`
- [ ] Verify `remove-pdv` Phase 1 is merged (routes removed); at minimum confirm remove-pdv has started
- [ ] Check `phase-1/task-02-dual-write-pattern/status.md` — this task and task-02 are parallel; coordinate on shared files listed in Do NOT Modify below
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Read `docs/kb/architecture/project-overview.md` for folder layout and entry points
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `package.json` | modify | Add `prisma`, `@prisma/client`, `pg` |
| `yarn.lock` | modify | Updated by yarn install |
| `prisma/schema.prisma` | create | Initial empty schema with datasource + generator |
| `prisma/migrations/` | create | Directory created by first migration |
| `src/config/postgres.js` | create | PrismaClient singleton |
| `src/config/database.js` | modify | Call both `connectMongo()` and `connectPostgres()` |
| `.env.example` | modify | Add `DATABASE_URL` |
| `jest.config.mjs` or test setup | modify | If tests need DATABASE_URL set to a test PG instance |

### Do NOT Modify

- `src/app/repositories/repository.js` — owned by task-02
- `src/runtime/dependencies.js` — owned by task-02 (for DualWrite wiring)

## Implementation Steps

### Step 1: Look up current package versions

Before installing, look up latest stable versions:
```bash
npm show prisma version
npm show @prisma/client version
npm show pg version
```

### Step 2: Install dependencies

```bash
yarn add prisma @prisma/client pg
```

Prisma CLI is used via `npx prisma`; no need to add it as a global.

### Step 3: Initialise Prisma

```bash
npx prisma init --datasource-provider postgresql
```

This creates `prisma/schema.prisma` and adds `DATABASE_URL` to `.env`. Move `DATABASE_URL` to `.env.example` with a placeholder:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?schema=public"
```

### Step 4: Configure schema.prisma

Edit `prisma/schema.prisma` to set the generator output:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

No models yet — they are added per-task in Phases 2 and 3.

### Step 5: Create PrismaClient singleton

Create `src/config/postgres.js`:
```js
import { PrismaClient } from '@prisma/client'

let prisma

function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient()
  }
  return prisma
}

async function connectPostgres() {
  const client = getPrismaClient()
  await client.$connect()
  console.log('PostgreSQL connected')
}

export { getPrismaClient, connectPostgres }
```

### Step 6: Wire connectPostgres into database.js

In `src/config/database.js`, import and call `connectPostgres()` alongside the existing `MongoServer.connect()`. The call should be non-blocking for now (log error, don't crash) so the app still starts if Postgres is not provisioned in a given environment:
```js
try {
  await connectPostgres()
} catch (err) {
  console.error('PostgreSQL connection failed (non-fatal during migration):', err.message)
}
```

This non-fatal behaviour is **intentional and temporary** — it lets the app boot without Postgres during the migration ramp-up. It will be made fatal in task-09 (flip reads).

### Step 7: Provision local and CI Postgres

**Local dev**: add a `POSTGRES_URL` service to docker-compose.yml if one exists, OR document in README that devs need a local PG instance. Set `DATABASE_URL` in `.env`.

**CI (GitHub Actions `config.yml`)**: add a `services: postgres:` block to the backend job:
```yaml
services:
  postgres:
    image: postgres:16
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: test
    ports:
      - 5432:5432
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```
Add `DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/test"` to the job's `env:`.

**Heroku**: document the provisioning step (do not run it — requires human action):
```
heroku addons:create heroku-postgresql:essential-0 --app <app-name>
```
The `DATABASE_URL` config var is set automatically by the addon.

### Step 8: Run initial migration

With `DATABASE_URL` set locally:
```bash
npx prisma migrate dev --name init
```

This creates `prisma/migrations/<timestamp>_init/migration.sql` with an empty schema. Commit this file.

### Step 9: Generate client

```bash
npx prisma generate
```

Add `prisma generate` to the CI `build` or `postinstall` step so the generated client is available.

### Step 10: Add `prisma generate` to package.json scripts

```json
{
  "scripts": {
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy"
  }
}
```

## Testing

- [ ] `yarn start` (or `node src/server.js`) boots without error when `DATABASE_URL` is set
- [ ] `yarn start` logs "PostgreSQL connection failed (non-fatal)" and continues when `DATABASE_URL` is absent
- [ ] `npx jest` passes all existing tests (Mongo-based tests should be unaffected)
- [ ] CI backend workflow passes with the Postgres service added
- [ ] `npx prisma migrate status` reports "Database schema is up to date"
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] Update `.env.example` with `DATABASE_URL` comment explaining it is required from Phase 2 onwards
- [ ] If no KB doc exists for the Prisma setup pattern in this repo, run `document-solution` after task completes
- [ ] Run `check-kb-index` if KB files are modified

## Completion Criteria

- [ ] `prisma/schema.prisma` committed with datasource + generator (no models yet)
- [ ] `prisma/migrations/<timestamp>_init/migration.sql` committed
- [ ] `src/config/postgres.js` committed with PrismaClient singleton
- [ ] `src/config/database.js` calls `connectPostgres()` (non-fatal)
- [ ] `.env.example` has `DATABASE_URL`
- [ ] CI config has Postgres service and `DATABASE_URL` env var
- [ ] All existing tests pass
- [ ] Changes committed to `plan/mongo-to-postgres/phase-1/task-01-prisma-setup` branch
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

- task-02 owns `src/app/repositories/repository.js`. Do not add `PrismaRepository` there — wait for task-02.
- Both tasks run in parallel. If task-02 needs the `getPrismaClient` export from `src/config/postgres.js` before this task merges, task-02 should stub an import and note the dependency in its status.md.
