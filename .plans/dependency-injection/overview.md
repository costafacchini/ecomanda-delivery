# Plan: Dependency Injection

**Created**: 2026-04-02
**Status**: Complete
**Branch**: feature/dependency-injection-wave-2
**Prerequisite**: `.plans/decouple-mongo` Phase 1–2 must be complete (injectable repositories must exist)

---

## Objective

Establish constructor injection as the single DI pattern across the application so that
**no class or function instantiates its own concrete dependencies**. Every dependency
flows in from the outside. The composition root (route files) owns wiring.

This makes every unit of code independently testable and removes the hard coupling
between services, controllers, and concrete infrastructure implementations.

---

## The Problem Today

Every class/function creates its own dependencies:

```js
// Inside a controller method — cannot be tested without a real DB
async create(req, res) {
  const licenseeRepository = new LicenseeRepositoryDatabase()  // hardcoded
  const licensee = await licenseeRepository.create(req.body)
}
```

```js
// routes/resources-routes.js — composition root, but passes nothing
const licenseesController = new LicenseesController()  // no deps passed
```

The routes ARE already the composition root — they just need to pass the dependencies in.

---

## The Target Pattern

**Classes** receive dependencies via constructor:
```js
class LicenseesController {
  constructor({ licenseeRepository }) {
    this.licenseeRepository = licenseeRepository
  }
  async create(req, res) {
    const licensee = await this.licenseeRepository.create(req.body)
  }
}
```

**Functions** receive dependencies as an options bag with defaults (keeps call sites unchanged):
```js
async function closeChat(data, { messageRepository = new MessageRepositoryDatabase() } = {}) {
  const message = await messageRepository.findFirst({ _id: data.messageId })
}
```

**Routes wire everything** — the single place that knows about concrete implementations:
```js
// resources-routes.js
const licenseeRepo = new LicenseeRepositoryDatabase()
const licenseesController = new LicenseesController({ licenseeRepository: licenseeRepo })
```

No DI framework is needed. Manual wiring in route files is explicit and easy to follow.

---

## Scope

| Layer | Files | DI pattern |
|-------|-------|------------|
| Controllers (class) | 15 controllers | Constructor injection |
| Function-based controllers | `LoginController` | Options-bag injection |
| Function-based services | 18 service functions | Options-bag injection (overlaps with decouple-mongo phase 3) |
| Middleware | `api-routes.js` auth middleware | Extract to function with injected repo |
| Routes / composition root | 5 route files | Wire all deps here |

---

## Tasks

### Phase 1 — Establish the Pattern (Controllers)

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 1.1 | Refactor `LicenseesController`: add constructor receiving `{ licenseeRepository, licenseesQuery }`, remove all `new *()` inside methods | Complete | `controllers/LicenseesController.js` | decouple-mongo 1.x |
| 1.2 | Refactor `ContactsController`: constructor receives `{ contactRepository, contactsQuery, queueServer }` | Complete | `controllers/ContactsController.js` | decouple-mongo 1.x |
| 1.3 | Refactor `UsersController`: constructor receives `{ userRepository }` | Complete | `controllers/UsersController.js` | decouple-mongo 1.3 |
| 1.4 | Refactor `TriggersController`: constructor receives `{ triggerRepository, triggersQuery }` | Complete | `controllers/TriggersController.js` | decouple-mongo 1.3 |
| 1.5 | Refactor `TemplatesController`: constructor receives `{ templateRepository, templatesQuery }` | Complete | `controllers/TemplatesController.js` | decouple-mongo 1.x |
| 1.6 | Refactor `MessagesController`: constructor receives `{ messagesQuery }` | Complete | `controllers/MessagesController.js` | — |
| 1.7 | Refactor `BackgroundjobsController`: constructor receives `{ backgroundjobRepository, queueServer }` | Complete | `controllers/BackgroundjobsController.js` | decouple-mongo 1.3 |
| 1.8 | Refactor `ChatsController`: constructor receives `{ bodyRepository, queueServer, publishMessage }` | Complete | `controllers/ChatsController.js` | decouple-mongo 1.3 |
| 1.9 | Refactor `MessengersController`: constructor receives `{ bodyRepository, queueServer }` | Complete | `controllers/MessengersController.js` | decouple-mongo 1.3 |
| 1.10 | Refactor `OrdersController`: constructor receives `{ integrationlogRepository, bodyRepository, queueServer }` | Complete | `controllers/OrdersController.js` | decouple-mongo 1.3 |
| 1.11 | Refactor `IntegrationsController`, `ChatbotsController`, `CartsController`, `BackupsController`: apply same pattern | Complete | remaining controllers | decouple-mongo 1.x |
| 1.12 | Refactor `LoginController` (function): accept `{ userRepository }` as options bag | Complete | `controllers/LoginController.js` | decouple-mongo 1.3 |

### Phase 2 — Refactor the Composition Root (Routes)

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 2.1 | Update `resources-routes.js`: instantiate all repositories and inject into controllers at module load time | Complete | `routes/resources-routes.js` | Phase 1 |
| 2.2 | Update `v1/v1-routes.js`: same wiring for v1 routes | Complete | `routes/v1/v1-routes.js` | Phase 1 |
| 2.3 | Extract `api-routes.js` auth middleware to a named function receiving `{ licenseeRepository }` | Complete | `routes/api-routes.js` | decouple-mongo 1.x |
| 2.4 | Update `login-route.js` to pass dependencies to `login` function | Complete | `routes/login-route.js` | 1.12 |
| 2.5 | Remove concrete fallback instantiation from controller/query helper defaults so route files remain the only composition roots for production wiring | Complete | `controllers/*.js`, `queries/*.js`, `services/Reset*.js`, `queries/BillingQuery.js`, `repositories/contact.js`, `repositories/template.js`, `repositories/trigger.js` | 2.1-2.4 |

### Phase 3 — Apply to Services (overlaps with decouple-mongo Phase 3)

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 3.1 | Verify all services from decouple-mongo phase 3 follow the options-bag pattern consistently; add missing deps (queueServer, plugins) where needed | Complete | `services/*.js` | decouple-mongo Phase 3 |
| 3.2 | Refactor remaining plugin/payment/integration constructors and factories so repositories and collaborator services are injected by callers instead of allocated as concrete fallbacks inside the runtime objects | Complete | `plugins/**/*.js`, plugin factories | decouple-mongo Phase 4, 3.1 |
| 3.3 | Refactor remaining query/report runtime paths (`BillingQuery`, `LicenseeMessagesByDayQuery`, `MessagesSended*`, `IntegrationlogsQuery`, websocket/report entrypoints, `schedule-messages-sended-yesterday.js`) so composition roots pass repositories explicitly | Complete | `queries/*.js`, `reports/*.js`, websocket/report entrypoints, `schedule-messages-sended-yesterday.js` | 3.1 |
| 3.4 | Refactor helper/runtime support paths (`ParseTriggerText`, `Trafficlight`) so caller-owned composition roots provide repositories and worker/runtime helpers stop allocating concrete persistence directly | Complete | `helpers/ParseTriggerText.js`, `helpers/Trafficlight.js`, related entrypoints | 3.1 |

### Phase 4 — Update Controller Tests

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 4.1 | Update controller specs to use `installMemoryRepositories()` / `resetMemoryRepositories()`, remove `mongoServer` from the controller test suite, and keep queue/rabbit spies explicit where the HTTP layer still exercises async wiring | Complete | `controllers/*.spec.js` (15 files) | decouple-mongo Phase 2, Phase 2 above |

---

## Current Checkpoint

All planned dependency-injection work is now complete.

- Controllers, login wiring, services, plugins, helper support paths, query/report classes,
  websocket report entrypoints, and schedule/job composition roots now receive collaborators
  from callers instead of allocating concrete repositories or runtime services internally.
- Runtime wiring is centralized in explicit composition roots such as route files,
  `src/app/runtime/dependencies.js`, `src/app/jobs/dependencies.js`, websocket report
  entrypoints, and schedule scripts.
- Controller specs no longer depend on `mongoServer`; the full controller suite runs through
  `installMemoryRepositories()` / `resetMemoryRepositories()` with the expanded parity layer
  in `src/app/repositories/testing.js`.
- The mongo-backed test helper in `.jest/mongo.js` now reuses a stable in-memory server and
  connection while dropping the database between specs, which removed the intermittent
  reconnect failures seen during full-suite verification.
- Verification passed for the full suite: `npx jest --runInBand --forceExit`
  (`129` suites / `2663` tests). Additional DI-surface lint verification passed with
  `npx eslint ... --quiet`; a broader non-quiet scoped lint still reports existing warning-only
  `no-console` / `no-warning-comments` findings outside the DI changes.

---

## Done When

- [x] No controller method contains `new *Repository()` or `new *Model()`
- [x] All controller constructors declare their dependencies explicitly
- [x] Production composition roots are the single place where concrete implementations are instantiated
- [x] 15 controller specs no longer import `mongoServer`
- [x] All 2663 tests still pass
