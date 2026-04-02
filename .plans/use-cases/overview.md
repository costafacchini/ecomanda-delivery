# Plan: Use Cases

**Created**: 2026-04-02
**Status**: Draft
**Branch**: feature/use-cases
**Prerequisite**: `.plans/dependency-injection` must be complete

---

## Objective

Extract business logic from controllers into dedicated **use case classes**. Each use case has
a single responsibility, a single `execute()` method, and receives all dependencies via constructor.

Controllers become **thin**: validate input → invoke use case → send response. No business
logic, no DB access, no queue calls — all of that lives in use cases.

---

## Why Use Cases After DI

Use cases need injected repositories from day one — a use case that does
`new *RepositoryDatabase()` internally is just relocating the same problem. DI must exist
first so use cases are born properly injectable and testable without a real database.

---

## The Pattern

```js
// src/app/usecases/licensees/CreateLicensee.js
class CreateLicensee {
  constructor({ licenseeRepository }) {
    this.licenseeRepository = licenseeRepository
  }

  async execute(fields) {
    return await this.licenseeRepository.create(fields)
  }
}
export { CreateLicensee }
```

```js
// controllers/LicenseesController.js (after use cases)
class LicenseesController {
  constructor({ createLicensee, updateLicensee, ... }) {
    this.createLicensee = createLicensee
  }

  async create(req, res) {
    try {
      const licensee = await this.createLicensee.execute(req.body)
      res.status(201).send(licensee)
    } catch (err) {
      res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
    }
  }
}
```

```js
// routes/resources-routes.js (composition root wires everything)
const licenseeRepo = new LicenseeRepositoryDatabase()
const createLicensee = new CreateLicensee({ licenseeRepository: licenseeRepo })
const licenseesController = new LicenseesController({ createLicensee })
```

**Use case test (no DB, no mongoServer):**
```js
it('creates a licensee', async () => {
  const licenseeRepository = new LicenseeRepositoryMemory()
  const useCase = new CreateLicensee({ licenseeRepository })
  const result = await useCase.execute({ name: 'Acme', licenseKind: 'demo' })
  expect(result.name).toBe('Acme')
})
```

---

## Use Cases to Extract

### Auth
| Use Case | Extracted From | Logic |
|----------|---------------|-------|
| `AuthenticateUser` | `LoginController.login` | Find user by email, validate password, sign JWT |

### Licensees
| Use Case | Extracted From | Logic |
|----------|---------------|-------|
| `CreateLicensee` | `LicenseesController.create` | Map 50+ fields, persist |
| `UpdateLicensee` | `LicenseesController.update` | Permit fields, serialize pedidos10_integration, update |
| `SetDialogWebhook` | `LicenseesController.setDialogWebhook` | Find licensee, conditionally call messenger plugin webhook |
| `SendLicenseeToPagarMe` | `LicenseesController.sendToPagarMe` | Find licensee, create or update PagarMe recipient |
| `SignPedidos10OrderWebhook` | `LicenseesController.signOrderWebhook` | Find licensee, call Pedidos10.signOrderWebhook |

### Contacts
| Use Case | Extracted From | Logic |
|----------|---------------|-------|
| `CreateContact` | `ContactsController.create` | Create contact, enqueue send-contact-to-pagarme job |
| `UpdateContact` | `ContactsController.update` | Update contact, enqueue send-contact-to-pagarme job |

### Users
| Use Case | Extracted From | Logic |
|----------|---------------|-------|
| `CreateUser` | `UsersController.create` | Create user via repository (removes `new User() + validateSync + save` antipattern) |
| `UpdateUser` | `UsersController.update` | Update user via repository (removes direct `User.updateOne`) |

### Triggers
| Use Case | Extracted From | Logic |
|----------|---------------|-------|
| `CreateTrigger` | `TriggersController.create` | Create trigger via repository (removes `new Trigger() + validateSync + save`) |
| `UpdateTrigger` | `TriggersController.update` | Update trigger via repository (removes direct `Trigger.updateOne`) |
| `ImportFacebookCatalog` | `TriggersController.importation` | Delegate to `FacebookCatalogImporter` |

### Orders / Integrations
| Use Case | Extracted From | Logic |
|----------|---------------|-------|
| `ReceivePedidos10Order` | `OrdersController.create` | Log to integrationlog, save body, enqueue pedidos10-webhook job |
| `ChangePedidos10OrderStatus` | `OrdersController.changeStatus` | Log to integrationlog, save body, enqueue pedidos10-change-order-status job |

### Background Jobs
| Use Case | Extracted From | Logic |
|----------|---------------|-------|
| `ScheduleBackgroundjob` | `BackgroundjobsController.create` | Create job via repository (removes `new Backgroundjob() + validateSync + save`), enqueue |

### Webhook Ingestion *(low priority — logic is thin)*
| Use Case | Extracted From | Logic |
|----------|---------------|-------|
| `IngestChatMessage` | `ChatsController.message` | Save body, enqueue chat-message job |
| `IngestMessengerMessage` | `MessengersController.message` | Save body, enqueue messenger-message job |

---

## Tasks

### Phase 1 — Scaffold

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 1.1 | Create `src/app/usecases/` directory structure mirroring domain folders: `auth/`, `licensees/`, `contacts/`, `users/`, `triggers/`, `orders/`, `backgroundjobs/`, `webhooks/` | Pending | `src/app/usecases/` *(new dir)* | DI plan complete |

### Phase 2 — Auth

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 2.1 | Extract `AuthenticateUser` use case + spec | Pending | `usecases/auth/AuthenticateUser.js` *(new)*, `AuthenticateUser.spec.js` *(new)* | 1.1 |
| 2.2 | Slim `LoginController`: delegate to `AuthenticateUser`, handle only HTTP response | Pending | `controllers/LoginController.js`, `routes/login-route.js` | 2.1 |

### Phase 3 — Licensees

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 3.1 | Extract `CreateLicensee` + spec | Pending | `usecases/licensees/CreateLicensee.js` *(new)* | 1.1 |
| 3.2 | Extract `UpdateLicensee` + spec | Pending | `usecases/licensees/UpdateLicensee.js` *(new)* | 1.1 |
| 3.3 | Extract `SetDialogWebhook`, `SendLicenseeToPagarMe`, `SignPedidos10OrderWebhook` + specs | Pending | `usecases/licensees/*.js` *(3 new files)* | 1.1 |
| 3.4 | Slim `LicenseesController`: receive use cases via constructor, replace all method bodies with `execute()` calls | Pending | `controllers/LicenseesController.js` | 3.1–3.3 |

### Phase 4 — Contacts

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 4.1 | Extract `CreateContact`, `UpdateContact` + specs | Pending | `usecases/contacts/*.js` *(2 new files)* | 1.1 |
| 4.2 | Slim `ContactsController` | Pending | `controllers/ContactsController.js` | 4.1 |

### Phase 5 — Users

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 5.1 | Extract `CreateUser`, `UpdateUser` + specs | Pending | `usecases/users/*.js` *(2 new files)* | 1.1 |
| 5.2 | Slim `UsersController`: eliminates `new User() + validateSync + save` antipattern | Pending | `controllers/UsersController.js` | 5.1 |

### Phase 6 — Triggers

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 6.1 | Extract `CreateTrigger`, `UpdateTrigger`, `ImportFacebookCatalog` + specs | Pending | `usecases/triggers/*.js` *(3 new files)* | 1.1 |
| 6.2 | Slim `TriggersController`: eliminates `new Trigger() + validateSync + save` antipattern | Pending | `controllers/TriggersController.js` | 6.1 |

### Phase 7 — Orders & Background Jobs

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 7.1 | Extract `ReceivePedidos10Order`, `ChangePedidos10OrderStatus` + specs | Pending | `usecases/orders/*.js` *(2 new files)* | 1.1 |
| 7.2 | Extract `ScheduleBackgroundjob` + spec | Pending | `usecases/backgroundjobs/ScheduleBackgroundjob.js` *(new)* | 1.1 |
| 7.3 | Slim `OrdersController`, `BackgroundjobsController` | Pending | `controllers/OrdersController.js`, `controllers/BackgroundjobsController.js` | 7.1, 7.2 |

### Phase 8 — Webhook Ingestion *(optional)*

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 8.1 | Extract `IngestChatMessage`, `IngestMessengerMessage` + specs | Pending | `usecases/webhooks/*.js` *(2 new files)* | 1.1 |
| 8.2 | Slim `ChatsController`, `MessengersController` | Pending | `controllers/ChatsController.js`, `controllers/MessengersController.js` | 8.1 |

### Phase 9 — Update Composition Root & Controller Tests

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 9.1 | Update route files to instantiate use cases and inject them into controllers | Pending | `routes/resources-routes.js`, `routes/v1/v1-routes.js`, `routes/login-route.js` | Phases 2–8 |
| 9.2 | Update controller specs: inject use cases as mocks; controllers now assert only on HTTP response behavior | Pending | `controllers/*.spec.js` | Phases 2–8 |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Some controller methods (`show`, `index`) barely have logic | Leave read-only list/show actions in controller if they're just query + send — only extract when there's real business logic |
| `CreateLicensee` maps 50+ fields — large use case | Acceptable: the mapping is already centralised in the controller; use case owns it instead |
| `LoginController` uses `jwt.sign` — external dep | Inject a `tokenService` wrapper or pass `jwt` as a dep |

## Done When

- [ ] `src/app/usecases/` exists with 18+ use case classes
- [ ] No controller method contains business logic (repository calls, queue calls, plugin calls)
- [ ] Every use case has a spec that runs without `mongoServer`
- [ ] Route files wire use cases to controllers
- [ ] All 2611 tests still pass
