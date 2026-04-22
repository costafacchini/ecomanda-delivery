# Plan: Dependency Injection

**Created**: 2026-04-02
**Status**: Active
**Branch**: feature/dependency-injection
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
| 3.1 | Verify all services from decouple-mongo phase 3 follow the options-bag pattern consistently; add missing deps (queueServer, plugins) where needed | Pending | `services/*.js` | decouple-mongo Phase 3 |

### Phase 4 — Update Controller Tests

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 4.1 | Update controller specs: instantiate controllers with `*RepositoryMemory` and mock `queueServer`; remove `mongoServer` from the 15 controller test files | Pending | `controllers/*.spec.js` (15 files) | decouple-mongo Phase 2, Phase 2 above |

---

## Current Checkpoint

Phase 1 and Phase 2 are now complete, including the controller/query fallback cleanup from
task `2.5`, but the plan is still **not done**.

Remaining gaps tied directly to the done criteria:

- Controllers, login wiring, and the query classes no longer allocate fallback concrete
  dependencies; route files now supply those collaborators explicitly.
- Route files are still not the single place where concrete implementations are instantiated.
  Remaining examples live in report/query helper code such as `BillingQuery.js`,
  `LicenseeMessagesByDayQuery.js`, and `MessagesSended.js`, and in other service/plugin paths
  that overlap with `.plans/decouple-mongo` Phase 3 and 4.
- Controller specs still import and use `mongoServer`.
- The full `All 2611 tests still pass` criterion has not been re-verified to completion in
  this plan execution log.
- Latest targeted verification for this wave passed:
  `src/app/controllers`,
  `ContactsQuery.spec.js`,
  `LicenseesQuery.spec.js`,
  `MessagesQuery.spec.js`,
  `TemplatesQuery.spec.js`,
  `TriggersQuery.spec.js`,
  `BillingQuery.spec.js`,
  `ResetChats.spec.js`,
  `ResetChatbots.spec.js`,
  `contact.spec.js`,
  `template.spec.js`,
  and `trigger.spec.js` (27 suites / 241 tests).

---

## Done When

- [x] No controller method contains `new *Repository()` or `new *Model()`
- [x] All controller constructors declare their dependencies explicitly
- [ ] Route files are the single place where concrete implementations are instantiated
- [ ] 15 controller specs no longer import `mongoServer`
- [ ] All 2611 tests still pass
