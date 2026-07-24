# Plan: Ecomanda Docker Containerization

**Status**: not-started
**Created**: 2026-07-24
**Last Updated**: 2026-07-24
**Assigned Dev**: Alan Costa Facchini
**PR Strategy**: single
**Spec**: [spec.md](spec.md) — 3 user stories · 9 acceptance scenarios · 5 success criteria

## Objective

Make ecomanda-delivery fully containerized: a production `Dockerfile` that works on any platform (Fly.io, Coolify, VPS), a `docker-compose.yml` for local dev with one command, and a `LocalStorage` provider as a drop-in alternative to S3 selectable via `STORAGE_PROVIDER` env var.

## Scope

### In Scope
- Production `Dockerfile` (TS backend only, no client/widget)
- `docker-compose.yml` with app + MongoDB + Redis services and an `uploads` volume
- `LocalStorage` class (`src/app/plugins/storage/Local.ts`) with `uploadFile()` + `presignedUrl()`
- Static `/uploads` route in Express to serve local files
- Storage factory in `Base.ts` switching on `STORAGE_PROVIDER=local|s3`
- `.env.example` additions: `STORAGE_PROVIDER`, `APP_URL`, `LOCAL_STORAGE_PATH`

### Out of Scope
- `Backup.ts` / `ClearBackups.ts` — remain S3-only; not called in normal message flow
- MinIO or any other S3-compatible local service
- Auth on the `/uploads` static route
- React client and widget build (intentionally excluded from Dockerfile)

## Kill Criteria
- If the `ecomanda-flyio` plan is blocked and `start-combined.sh` cannot be created before this plan executes — task-01 must adapt and create the script itself (document in status.md)

## Phases

| Phase | Name | Tasks | Dependencies | Description |
|-------|------|-------|--------------|-------------|
| 1 | Foundation | task-01, task-02 | None | Dockerfile + LocalStorage class — parallel, no shared files |
| 2 | Wiring | task-03, task-04 | Phase 1 | Storage factory in Base.ts + docker-compose app service — parallel |

## Task Summary

| Task Path | Title | Phase | Status | Depends On |
|-----------|-------|-------|--------|------------|
| phase-1/task-01-dockerfile | Create production Dockerfile | 1 | not-started | — |
| phase-1/task-02-local-storage | Implement LocalStorage provider | 1 | not-started | — |
| phase-2/task-03-storage-factory | Wire storage factory in Base.ts | 2 | not-started | phase-1/task-02-local-storage |
| phase-2/task-04-compose-dev | Add app service to docker-compose | 2 | not-started | phase-1/task-01-dockerfile |

## Branch Convention

Pattern: `plan/ecomanda-docker/{task-path}`

Example branches:
- `plan/ecomanda-docker/phase-1/task-01-dockerfile`
- `plan/ecomanda-docker/phase-1/task-02-local-storage`

> **Note**: All implementation is in the `ecomanda-delivery` repo. Branches are tracked in ticketmaker but commits go to ecomanda-delivery.

Base branch: `main` (ecomanda-delivery)

## Key Files

| File | Repo | Action |
|------|------|--------|
| `Dockerfile` | ecomanda-delivery | Create |
| `start-combined.sh` | ecomanda-delivery | Reference (created by ecomanda-flyio/task-01, or adapt here) |
| `docker-compose.yml` | ecomanda-delivery | Modify — add `app` service + `uploads` volume |
| `src/app/plugins/storage/Local.ts` | ecomanda-delivery | Create |
| `src/app/plugins/storage/Local.spec.ts` | ecomanda-delivery | Create (Jest test stubs) |
| `src/app/plugins/messengers/Base.ts` | ecomanda-delivery | Modify — storage factory |
| `src/config/http.ts` | ecomanda-delivery | Modify — add `/uploads` static route |
| `.env.example` | ecomanda-delivery | Modify — add STORAGE_PROVIDER, APP_URL, LOCAL_STORAGE_PATH |

## Risks

- **ecomanda-flyio dependency**: task-01 references `start-combined.sh` from that plan. If not yet merged, task-01 must create it. Mitigation: check `ecomanda-flyio` status before starting.
- **Base.ts file conflict**: task-02 (LocalStorage) and task-03 (factory in Base.ts) share an implicit dependency — execute sequentially.
- **Static file URL in production**: If `APP_URL` is not set and `STORAGE_PROVIDER=local`, presigned URLs will be malformed. Mitigation: validate `APP_URL` presence when `STORAGE_PROVIDER=local` at boot.

## Success Criteria

- [ ] SC-001: `docker-compose up` starts all services; app at `http://localhost:5000`
- [ ] SC-002: `docker build .` < 800 MB, no client/widget built
- [ ] SC-003: `STORAGE_PROVIDER=local` — file saved to `uploads/`, URL returned correctly
- [ ] SC-004: `STORAGE_PROVIDER=s3` — existing S3 behaviour unchanged
- [ ] SC-005: Storage switch requires only env var change

## References

- **Related Plans**: [ecomanda-flyio](../ecomanda-flyio/overview.md) — shares `start-combined.sh` and `Dockerfile` base
- **JIRA Epic**: N/A
