# Plan: Decouple MongoDB from the Application

**Created**: 2026-04-02
**Status**: Complete
**Branch**: feature/decouple-mongo-phase-2

## Objective

Complete the in-progress repository pattern so that:
1. **No service, plugin, or controller imports a Mongoose model directly** — all DB access goes through a repository
2. **Every repository has an in-memory counterpart** (`*RepositoryMemory`) usable in tests without a real DB
3. **Services and plugins accept repositories as injectable dependencies**, enabling unit tests that never touch MongoDB
4. **Service and plugin specs no longer use `mongoServer`** — those unit tests become fast and isolated, while Mongo-backed repository coverage and a minimal bootstrap guardrail remain intentional

## Current State Assessment

### What exists
- `Repository` base class — stub only (empty methods, no shared implementation)
- 9 concrete `*RepositoryDatabase` classes: `cart`, `contact`, `licensee`, `message`, `order`, `product`, `template`, `trigger` + `room` (non-class functions)
- **0** `*RepositoryMemory` implementations

### Gaps
| Gap | Detail |
|-----|--------|
| Missing repositories | `Body`, `Backgroundjob`, `User`, `Integrationlog` have no repository class |
| `room.js` is functions, not a class | Inconsistent with all other repositories; can't be mocked via injection |
| No `save(document)` on Repository | Services call `.save()` directly on Mongoose documents — **79 call sites** |
| No in-memory implementations | All 13 entities need a `*RepositoryMemory` class |
| Services instantiate their own repositories | `new *RepositoryDatabase()` inside service functions — not injectable |
| 24 service specs use `mongoServer` | Should be unit tests with in-memory repos |
| 21 plugin specs use `mongoServer` | Same issue |

---

## Phase 1 — Complete the Repository Interface

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 1.1 | Add `save(document)` method to `Repository` base class and all existing `*RepositoryDatabase` implementations. This wraps `document.save()` so callers never touch Mongoose directly | Complete | `repository.js`, all `*RepositoryDatabase` files | — |
| 1.2 | Convert `room.js` from plain functions to `RoomRepositoryDatabase` class extending `Repository`; update all callers (`Chatwoot.js`, `Crisp.js`) | Complete | `repositories/room.js`, `plugins/chats/Chatwoot.js`, `plugins/chats/Crisp.js` | — |
| 1.3 | Create `BodyRepositoryDatabase`, `BackgroundjobRepositoryDatabase`, `UserRepositoryDatabase`, `IntegrationlogRepositoryDatabase` | Complete | `repositories/body.js` *(new)*, `repositories/backgroundjob.js` *(new)*, `repositories/user.js` *(new)*, `repositories/integrationlog.js` *(new)* | — |

---

## Phase 2 — In-Memory Repository Implementations

Create `*RepositoryMemory` for every entity. Each stores records in a plain JS array and implements the same interface as its `*RepositoryDatabase` sibling. These are **the single enabler** for decoupled tests.

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 2.1 | Create in-memory repos for core entities: `LicenseeRepositoryMemory`, `ContactRepositoryMemory`, `MessageRepositoryMemory` | Complete | `repositories/licensee.js`, `repositories/contact.js`, `repositories/message.js`, `repositories/memory-core.spec.js` | 1.1 |
| 2.2 | Create in-memory repos for secondary entities: `RoomRepositoryMemory`, `CartRepositoryMemory`, `OrderRepositoryMemory`, `ProductRepositoryMemory` | Complete | `repositories/room.js`, `repositories/cart.js`, `repositories/order.js`, `repositories/product.js`, `repositories/memory-secondary.spec.js` | 1.2 |
| 2.3 | Create in-memory repos for lookup entities: `TemplateRepositoryMemory`, `TriggerRepositoryMemory`, `BodyRepositoryMemory`, `BackgroundjobRepositoryMemory`, `UserRepositoryMemory`, `IntegrationlogRepositoryMemory` | Complete | `repositories/template.js`, `repositories/trigger.js`, `repositories/body.js`, `repositories/backgroundjob.js`, `repositories/user.js`, `repositories/integrationlog.js`, `repositories/memory-lookup.spec.js` | 1.3 |

---

## Phase 3 — Dependency Injection in Services

Services currently instantiate `new *RepositoryDatabase()` internally. They need to accept repositories as **optional parameters** (defaulting to the DB implementation so production code is unchanged).

Pattern to follow:
```js
// Before
async function closeChat(data) {
  const messageRepository = new MessageRepositoryDatabase()
  ...
}

// After
async function closeChat(data, { messageRepository = new MessageRepositoryDatabase() } = {}) {
  ...
}
```

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 3.1 | Refactor simple services to accept injectable repos: `CloseChat`, `ChatMessage`, `ChatbotMessage`, `ChatbotTransfer`, `MessengerMessage`, `SendMessageToChat`, `SendMessageToChatbot`, `SendMessageToMessenger`, `TransferToChat` | Complete | `services/CloseChat.js`, `services/ChatMessage.js`, `services/ChatbotMessage.js`, `services/ChatbotTransfer.js`, `services/MessengerMessage.js`, `services/SendMessage*.js`, `services/TransferToChat.js` | 2.1 |
| 3.2 | Refactor reset/batch services: `ResetChatbots`, `ResetChats`, `ResetCarts`; replace direct `.save()` calls with `repository.save()` | Complete | `services/ResetChatbots.js`, `services/ResetChats.js`, `services/ResetCarts.js` | 2.1, 2.2 |
| 3.3 | Refactor background job services: `ProcessBackgroundjob*` (6 files), `IntegrationSendOrder`, `ProcessPagarmeOrderPaid`, `ProcessWebhookRequest`; replace direct model imports and `.save()` with injected repositories | Complete | `services/ProcessBackgroundjob*.js`, `services/IntegrationSendOrder.js`, `services/ProcessPagarmeOrderPaid.js`, `services/ProcessWebhookRequest.js` | 2.2, 2.3 |
| 3.4 | Refactor integration services: `Pedidos10ChangeOrderStatus`, `Pedidos10Webhook`, `IntegrationSendOrder`, `SendContactToPagarMe` | Complete | `services/Pedidos10*.js`, `services/SendContactToPagarMe.js` | 2.3 |

---

## Phase 4 — Eliminate Direct Model Imports in Plugins

Plugins currently import Mongoose models directly and call `.save()` on them. They need repositories injected via constructor.

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 4.1 | Refactor `plugins/chatbots/Landbot.js`: replace `Room`, `Trigger` model imports and `.save()` calls with `roomRepository` and `triggerRepository` injected in constructor | Complete | `plugins/chatbots/Landbot.js` | 2.2 |
| 4.2 | Refactor `plugins/chats/Base.js`, `Rocketchat.js`, `Chatwoot.js`, `Crisp.js`, `Cuboup.js`, `Dialog.js`: replace `Room`, `Trigger` model usage with repositories | Complete | `plugins/chats/Base.js`, `Rocketchat.js`, `Chatwoot.js`, `Crisp.js`, `Cuboup.js`, `Dialog.js` (only those with direct model usage) | 2.2, 1.2 |
| 4.3 | Refactor `plugins/messengers/Dialog.js`, `Pabbly.js`, `YCloud.js`: replace `Trigger`, `Template` model imports with injected repositories | Complete | `plugins/messengers/Dialog.js`, `Pabbly.js`, `YCloud.js` | 2.3 |
| 4.4 | Refactor `plugins/payments/PagarMe/*` (Card, Customer, Payment, Recipient): replace `Integrationlog` model imports and `.save()` calls with `integrationlogRepository` | Complete | `plugins/payments/PagarMe/Card.js`, `Customer.js`, `Payment.js`, `Recipient.js` | 2.3 |
| 4.5 | Refactor `plugins/integrations/Pedidos10/Order.js`, `services/Auth.js`, `OrderStatus.js`, `Webhook.js`: replace `Licensee`, `Integrationlog` model imports with repositories | Complete | `plugins/integrations/Pedidos10/**/*.js` | 2.3 |
| 4.6 | Refactor `plugins/importers/facebook_catalog/index.js`: replace `Trigger`, `Product` model imports with repositories | Complete | `plugins/importers/facebook_catalog/index.js` | 2.3 |

---

## Phase 5 — Eliminate Direct Model Imports in Controllers and Support Code

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 5.1 | Refactor controllers using `Body`: `ChatbotsController`, `ChatsController`, `IntegrationsController`, `MessengersController`, `OrdersController` — inject `BodyRepositoryDatabase` | Complete | `controllers/ChatbotsController.js`, `ChatsController.js`, `IntegrationsController.js`, `MessengersController.js`, `OrdersController.js` | 1.3 |
| 5.2 | Refactor `BackgroundjobsController`: replace `Backgroundjob` model import with `BackgroundjobRepositoryDatabase` | Complete | `controllers/BackgroundjobsController.js` | 1.3 |
| 5.3 | Refactor `LoginController`, `UsersController`: replace `User` model import with `UserRepositoryDatabase` | Complete | `controllers/LoginController.js`, `controllers/UsersController.js` | 1.3 |
| 5.4 | Refactor `TemplatesController`, `TriggersController`: these already have repositories but may use the model directly for some operations | Complete | `controllers/TemplatesController.js`, `TriggersController.js` | — |
| 5.5 | Refactor `OrdersController`: replace `Integrationlog` model import with `IntegrationlogRepositoryDatabase` | Complete | `controllers/OrdersController.js` | 1.3 |
| 5.6 | Remove the remaining non-repository model imports and raw document-save paths in support code (`Trafficlight`, query classes, startup/bootstrap, smoke scripts, repository-backed model bootstrap) | Complete | `helpers/Trafficlight.js`, `queries/IntegrationlogsQuery.js`, `queries/MessagesFailed.js`, `setup/database.js`, `config/http.js`, `scripts/smoke/**/*`, `repositories/index.js`, `models/Cart.js` | 2.3, 4.6 |

---

## Phase 6 — Update Tests

With in-memory repos and injectable dependencies in place, replace `mongoServer` in service/plugin specs.

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 6.1 | Update 24 service specs: replace `mongoServer.connect/disconnect` + `*RepositoryDatabase` setup with `*RepositoryMemory`; assert on in-memory state instead of querying DB | Complete | `services/*.spec.js` (24 files) | Phase 3 |
| 6.2 | Update 21 plugin specs: replace `mongoServer` with `*RepositoryMemory` | Complete | `plugins/**/*.spec.js` (21 files) | Phase 4 |
| 6.3 | Keep Mongo-backed coverage only where it is intentional: repository DB specs plus the explicit Mongo bootstrap guardrail; service and plugin specs must stay memory-backed | Complete | `repositories/*.spec.js`, `src/config/mongo.spec.js`, `src/setup/database.spec.js` | — |

---

## Risks

| Risk | Mitigation |
|------|------------|
| `*RepositoryMemory` must faithfully replicate query semantics | Filter matching needs careful implementation; add parity tests between Memory and Database repos for critical queries |
| `message.js` repository has domain logic (`createInteractiveMessages`) that belongs in a service | Note for follow-up: these methods are correctly scoped out-of-place; move to a `MessageService` in a separate PR |
| Controllers use `req`/`res` and are harder to unit-test | Phase 5 is decoupling only — controller unit tests are a separate concern |
| 45 spec files to update in Phase 6 | Each can be done incrementally; tests still pass with DB during transition |

## Done When

- [x] No Mongoose model is imported outside of `repositories/` and `models/`
- [x] No `.save()` call exists outside `*RepositoryDatabase.save()` implementations
- [x] Every entity has a `*RepositoryMemory` class
- [x] 24 service specs + 21 plugin specs no longer import or call `mongoServer`
- [x] All 2656 tests pass in the current branch

## Current Checkpoint

- Phases 1 through 5 are complete: repositories now cover every entity used by the app runtime, plugin/controller/support code no longer imports models directly, and runtime writes now go through repository APIs instead of raw document saves.
- The chat/chatbot/messenger plugin families are repository-only, and this wave finished the remaining plugin cleanup in `PagarMe`, `Pedidos10`, and the Facebook catalog importer.
- Controller cleanup was already effectively complete before this wave; the missing work behind the import criterion was in support code (`Trafficlight`, reporting queries, startup/bootstrap, and smoke scripts), which is now repository-backed as well.
- Phase 6 service/plugin scope is now complete. The remaining 24 service specs and 21 plugin specs were moved off `mongoServer` onto the shared memory-repository harness in `src/app/repositories/testing.js`, and the runtime parity fixes that surfaced during that migration were folded back into the memory repositories (`$gt`/`$lt` support, Mongo-like `$ne: null` handling, document `.save()` support, cart totals/defaults, room defaults, and schema-like string casting for contact/licensee ids).
- Mongo is still intentionally exercised in repository DB specs and the explicit bootstrap guardrail tests (`src/config/mongo.spec.js`, `src/setup/database.spec.js`). Broader controller/model/query integration specs still use Mongo today, but they are no longer on the critical path for the decoupling goal of fast unit coverage in services/plugins.
- `npx jest --runInBand` passed on April 23, 2026 with 128 suites / 2656 tests. Jest still reports the existing open-handles warning after completion, but the suite finished green.
