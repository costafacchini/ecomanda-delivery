# Spec: Ecomanda Docker Containerization

**Last Updated**: 2026-07-24
**Plan**: ecomanda-docker

---

## User Stories

### Story 1 (P1) — Developer runs the full stack locally with one command

**As a** developer,
**I want** to run `docker-compose up` and have the complete ecomanda stack available locally,
**So that** I can develop and test without external services or manual process management.

#### Acceptance Scenarios

**Scenario 1.1 — Full stack boots**
- Given: `docker-compose up` is run from the ecomanda-delivery root
- When: all services start
- Then: MongoDB, Redis, and the ecomanda app (server + worker) are running; the app is reachable at `http://localhost:5000`

**Scenario 1.2 — App connects to local MongoDB and Redis**
- Given: no external DB or Redis is configured
- When: the app boots via docker-compose
- Then: the server logs confirm connection to the local MongoDB and Redis containers (no Atlas/external URL needed)

**Scenario 1.3 — Files stored on local volume**
- Given: `STORAGE_PROVIDER=local` in docker-compose env
- When: a file upload is processed
- Then: the file is written to the `uploads` Docker volume and accessible via `GET /uploads/<path>`

---

### Story 2 (P2) — Production container works on any platform with external DB and cloud storage

**As a** DevOps operator,
**I want** a single Docker image that is configurable via environment variables for DB, Redis, and storage,
**So that** I can deploy ecomanda on Fly.io, Coolify, or any VPS without code changes.

#### Acceptance Scenarios

**Scenario 2.1 — Image builds without client/widget**
- Given: the production Dockerfile is used
- When: `docker build` runs
- Then: the image compiles only the TypeScript backend; `client/` and `widget/` are not built; the image is < 800 MB

**Scenario 2.2 — External MongoDB and Redis via env vars**
- Given: `MONGODB_URI` and `REDIS_URL` point to external services
- When: the container starts
- Then: the app connects to those external services; no local DB is started

**Scenario 2.3 — S3 storage in production**
- Given: `STORAGE_PROVIDER=s3` and valid `AWS_*` env vars
- When: a file upload is processed
- Then: the file is uploaded to S3 and a public URL is returned (existing behaviour, unchanged)

**Scenario 2.4 — Local storage in production-like mode**
- Given: `STORAGE_PROVIDER=local` and `APP_URL=https://myapp.fly.dev`
- When: a file upload is processed
- Then: the file is stored in the container's local filesystem and a URL of the form `https://myapp.fly.dev/uploads/<path>` is returned

---

### Story 3 (P3) — Storage backend is swappable without touching messenger code

**As a** developer,
**I want** to switch between `local` and `s3` storage by changing one env var,
**So that** I can develop locally without AWS credentials and deploy to production with S3.

#### Acceptance Scenarios

**Scenario 3.1 — STORAGE_PROVIDER=local uses LocalStorage**
- Given: `STORAGE_PROVIDER=local`
- When: `uploadFile()` is called in `Base.ts`
- Then: `LocalStorage.uploadFile()` is invoked; no AWS SDK calls are made

**Scenario 3.2 — STORAGE_PROVIDER=s3 uses S3 (default)**
- Given: `STORAGE_PROVIDER=s3` (or env var absent)
- When: `uploadFile()` is called in `Base.ts`
- Then: `S3.uploadFile()` is invoked (existing behaviour, unchanged)

---

## Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-001 | A `Dockerfile` exists at the repo root; it builds only the TS backend (skips client/widget) and runs server + worker via `start-combined.sh` |
| FR-002 | `docker-compose.yml` includes an `app` service that builds from the `Dockerfile`, with `depends_on` for mongo and redis |
| FR-003 | `docker-compose.yml` mounts an `uploads` volume into the app container at `/app/uploads` |
| FR-004 | A `LocalStorage` class exists at `src/app/plugins/storage/Local.ts` implementing `uploadFile()` and `presignedUrl()` matching the `S3` interface |
| FR-005 | Express serves static files from `/app/uploads` at the `/uploads` route |
| FR-006 | `Base.ts`'s `uploadFile` helper selects storage provider based on `STORAGE_PROVIDER` env var (`local` → LocalStorage, anything else → S3) |
| FR-007 | `APP_URL` env var is used by `LocalStorage.presignedUrl()` to construct the public file URL |
| FR-008 | `.env.example` documents `STORAGE_PROVIDER`, `LOCAL_STORAGE_PATH`, and `APP_URL` |
| FR-009 | `start-combined.sh` (from plan `ecomanda-flyio`) is the container entrypoint for both dev and production |

---

## Success Criteria

| ID | Criterion |
|----|-----------|
| SC-001 | `docker-compose up` starts all services with no manual steps; app responds at `http://localhost:5000` |
| SC-002 | `docker build .` produces an image without building client/widget; image size < 800 MB |
| SC-003 | With `STORAGE_PROVIDER=local`, uploading a file saves it under `uploads/` and returns a `http://localhost:5000/uploads/...` URL |
| SC-004 | With `STORAGE_PROVIDER=s3`, existing S3 behaviour is unchanged (no regression) |
| SC-005 | Switching `STORAGE_PROVIDER` requires no code change — only env var update |

---

## Assumptions

- `start-combined.sh` and `build:fly`/`start:fly` npm scripts are created by plan `ecomanda-flyio` task-01. If that plan is not yet merged, this plan's task-01 must create them as well (document in status.md if adapted).
- File attachments in the app are only used by `Base.ts`'s `uploadFile` helper — no other callers create S3 instances directly (confirmed: only `Dialog.ts` via `Base.ts` inheritance and `Backup.ts`/`ClearBackups.ts` which are scheduled scripts not in scope).
- `Backup.ts` and `ClearBackups.ts` continue to use S3 directly — they are out of scope for the local storage adapter.
- The `LOCAL_STORAGE_PATH` defaults to `/app/uploads` inside the container.
- No authentication is needed for the `/uploads` static route in local dev mode.
