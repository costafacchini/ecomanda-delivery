# Plan: Use Cases

**Status**: in-progress
**Created**: 2026-04-02
**Last Updated**: 2026-04-28T23:09Z
**Assigned Dev**: Alan
**Master Plan**: None

## Objective

Extract business logic from controllers into dedicated use case classes, each with a single `execute()` method and constructor-injected dependencies. Controllers become thin HTTP adapters: validate input, invoke use case, send response.

## Scope

### In Scope
- Scaffold `src/app/usecases/` directory structure mirroring domain folders
- Extract use cases for Auth, Licensees, Contacts, Users, Triggers, Orders, Backgroundjobs, and Webhooks
- Slim each controller to delegate to its use cases
- Update composition root (route files) to wire use cases into controllers
- Update controller specs to mock use cases and assert only HTTP behaviour
- Add use case specs that run without `mongoServer`

### Out of Scope
- Read-only `show`/`index` controller actions that contain no business logic — leave in controller unless logic justifies extraction
- Changing the DI container or repository layer — {prerequisite `dependency-injection` plan owns that}

## Kill Criteria

- If controllers become so thin that use cases duplicate controller boilerplate without adding clarity (i.e. every use case is a one-liner passthrough with no testable logic).

## Phases

| Phase | Name | Tasks | Dependencies | Description |
|-------|------|-------|--------------|-------------|
| 1 | Scaffold | task-01 | None | Create `src/app/usecases/` directory tree |
| 2 | Auth | task-02, task-03 | Phase 1 | Extract `AuthenticateUser`; slim `LoginController` |
| 3 | Licensees | task-04, task-05, task-06 | Phase 1 | Extract 5 licensee use cases; slim `LicenseesController` |
| 4 | Contacts | task-07, task-08 | Phase 1 | Extract 2 contact use cases; slim `ContactsController` |
| 5 | Users | task-09, task-10 | Phase 1 | Extract 2 user use cases; slim `UsersController` |
| 6 | Triggers | task-11, task-12 | Phase 1 | Extract 3 trigger use cases; slim `TriggersController` |
| 7 | Orders & Backgroundjobs | task-13, task-14, task-15 | Phase 1 | Extract order and backgroundjob use cases; slim controllers |
| 8 | Webhook Ingestion (optional) | task-16, task-17 | Phase 1 | Extract 2 webhook use cases; slim chat/messenger controllers |
| 9 | Composition Root & Tests | task-18, task-19 | Phases 2–8 | Wire use cases in routes; update controller specs |

## Task Summary

| Task Path | Title | Phase | Status | Depends On |
|-----------|-------|-------|--------|------------|
| phase-1/task-01-scaffold-usecases-dir | Scaffold usecases directory structure | 1 | complete | — |
| phase-2/task-02-authenticate-user-usecase | Extract AuthenticateUser use case | 2 | complete | phase-1/task-01-scaffold-usecases-dir |
| phase-2/task-03-slim-login-controller | Slim LoginController | 2 | complete | phase-2/task-02-authenticate-user-usecase |
| phase-3/task-04-licensee-create-update-usecases | Extract CreateLicensee and UpdateLicensee use cases | 3 | complete | phase-1/task-01-scaffold-usecases-dir |
| phase-3/task-05-licensee-external-action-usecases | Extract SetDialogWebhook, SendLicenseeToPagarMe, SignPedidos10OrderWebhook | 3 | complete | phase-1/task-01-scaffold-usecases-dir |
| phase-3/task-06-slim-licensees-controller | Slim LicenseesController | 3 | complete | phase-3/task-04-licensee-create-update-usecases, phase-3/task-05-licensee-external-action-usecases |
| phase-4/task-07-contact-usecases | Extract CreateContact and UpdateContact use cases | 4 | complete | phase-1/task-01-scaffold-usecases-dir |
| phase-4/task-08-slim-contacts-controller | Slim ContactsController | 4 | not-started | phase-4/task-07-contact-usecases |
| phase-5/task-09-user-usecases | Extract CreateUser and UpdateUser use cases | 5 | not-started | phase-1/task-01-scaffold-usecases-dir |
| phase-5/task-10-slim-users-controller | Slim UsersController | 5 | not-started | phase-5/task-09-user-usecases |
| phase-6/task-11-trigger-usecases | Extract CreateTrigger, UpdateTrigger, ImportFacebookCatalog use cases | 6 | not-started | phase-1/task-01-scaffold-usecases-dir |
| phase-6/task-12-slim-triggers-controller | Slim TriggersController | 6 | not-started | phase-6/task-11-trigger-usecases |
| phase-7/task-13-order-usecases | Extract ReceivePedidos10Order and ChangePedidos10OrderStatus use cases | 7 | not-started | phase-1/task-01-scaffold-usecases-dir |
| phase-7/task-14-backgroundjob-usecases | Extract ScheduleBackgroundjob use case | 7 | not-started | phase-1/task-01-scaffold-usecases-dir |
| phase-7/task-15-slim-orders-backgroundjobs-controllers | Slim OrdersController and BackgroundjobsController | 7 | not-started | phase-7/task-13-order-usecases, phase-7/task-14-backgroundjob-usecases |
| phase-8/task-16-webhook-usecases | Extract IngestChatMessage and IngestMessengerMessage use cases | 8 | not-started | phase-1/task-01-scaffold-usecases-dir |
| phase-8/task-17-slim-chats-messengers-controllers | Slim ChatsController and MessengersController | 8 | not-started | phase-8/task-16-webhook-usecases |
| phase-9/task-18-update-composition-root | Update route files to wire use cases into controllers | 9 | not-started | phase-2/task-03-slim-login-controller, phase-3/task-06-slim-licensees-controller, phase-4/task-08-slim-contacts-controller, phase-5/task-10-slim-users-controller, phase-6/task-12-slim-triggers-controller, phase-7/task-15-slim-orders-backgroundjobs-controllers |
| phase-9/task-19-update-controller-tests | Update controller specs to mock use cases | 9 | not-started | phase-9/task-18-update-composition-root |

## Branch Convention

Pattern: `plan/use-cases/phase-{N}/task-{NN}-{slug}`
Base branch: `main`

## Key Files

| File/Directory | Relevance |
|----------------|-----------|
| `src/app/controllers/` | All controllers to be slimmed |
| `src/app/usecases/` | New directory — all use case classes live here |
| `src/app/routes/resources-routes.js` | Composition root for admin/API routes |
| `src/app/routes/login-route.js` | Composition root for auth route |
| `src/app/routes/v1/v1-routes.js` | Composition root for v1 routes |

## Defects

| Defect Task | Title | Found During | Blocks | Status |

## Risks

- `CreateLicensee` maps 50+ fields (large use case) — Acceptable: the mapping is already centralised in the controller; use case inherits ownership
- `LoginController` uses `jwt.sign` directly — Inject a `tokenService` wrapper or pass `jwt` as a constructor dependency
- Some `show`/`index` methods have no logic — Leave read-only actions in controller; only extract when there is real business logic

## Success Criteria

- [ ] `src/app/usecases/` exists with 18+ use case classes
- [ ] No controller method contains business logic (repository calls, queue calls, plugin calls)
- [ ] Every use case has a spec that runs without `mongoServer`
- [ ] Route files wire use cases to controllers
- [ ] All tests pass
- [ ] No regressions in existing functionality
