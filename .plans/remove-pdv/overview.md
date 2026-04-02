# Plan: Remove PDV (Point-of-Sale) Domain

**Created**: 2026-04-02
**Status**: Draft
**Branch**: feature/remove-pdv
**Prerequisite**: None — this is an independent extraction. Can run in parallel with `decouple-mongo` but conflicts with `dependency-injection` and `use-cases` if those touch PDV controllers.

---

## Objective

The codebase contains a full PDV (Ponto de Venda / Point of Sale) layer:
cart management, payment gateway (PagarMe), order platform integration (Pedidos10),
and delivery-cart plugins (Alloy, Go2go, Go2goV2). This layer is a **separate concern**
from the core domain (messaging, chatbots, WhatsApp/chat routing).

Remove the PDV layer entirely: delete all associated models, repositories, controllers,
plugins, services, jobs, queries, factories, and routes. Strip PDV-specific fields from
the core `Licensee` and `Contact` models.

> **Important**: Confirm with stakeholders that each sub-system is no longer in use
> before executing each phase. Phases are ordered so that routes go first (safest
> change to observe traffic impact) and models go last (hardest to revert once data
> is dropped).

---

## PDV Surface Area Inventory

### Models (5 files)

| File | Description |
|------|-------------|
| `src/app/models/Cart.js` | Cart with products, totals, delivery address, PIX/credit card payment fields, PagarMe gateway fields |
| `src/app/models/Order.js` | Pedidos10 order structure with items, payments, integration status |
| `src/app/models/Product.js` | Product catalog item (`product_retailer_id`, `name`, `licensee`) |
| `src/app/models/Integrationlog.js` | Audit log for Pedidos10/PagarMe API calls |
| `src/app/models/Backgroundjob.js` | Scheduled job record — used exclusively for payment/order background work |

### PDV Fields on Core Models

| Model | Fields to strip |
|-------|----------------|
| `Licensee.js` | `cartDefault`, `useCartGallabox`, `recipient_id` (PagarMe), `pedidos10_active`, `pedidos10_integration`, `pedidos10_integrator` |
| `Contact.js` | `address`, `address_number`, `address_complement`, `neighborhood`, `cep`, `delivery_tax`, `plugin_cart_id`, `address_id` |

### Controllers (3 full + 2 methods)

| File | Scope |
|------|-------|
| `src/app/controllers/CartsController.js` | Entire file — 9 methods (create, update, show, close, addItem, removeItem, send, getCart, getPayment, reset) |
| `src/app/controllers/OrdersController.js` | Entire file — create + changeStatus (Pedidos10 webhook receiver) |
| `src/app/controllers/IntegrationsController.js` | Entire file — generic webhook ingestion endpoint |
| `src/app/controllers/LicenseesController.js` | Methods only: `sendToPagarMe`, `signOrderWebhook` |

### Plugins (19 source files)

| Directory | Files |
|-----------|-------|
| `src/app/plugins/carts/` | `Alloy.js`, `Go2go.js`, `Go2goV2.js`, `factory.js` |
| `src/app/plugins/carts/adapters/` | `Alloy.js`, `Default.js`, `Gallabox.js`, `factory.js` |
| `src/app/plugins/payments/` | `PagarMe.js` |
| `src/app/plugins/payments/PagarMe/` | `Card.js`, `Customer.js`, `Payment.js`, `Parser.js`, `Recipient.js` |
| `src/app/plugins/integrations/` | `IntegratorBase.js`, `Pedidos10.js`, `factory.js` |
| `src/app/plugins/integrations/Pedidos10/` | `Order.js`, `Parser.js` |
| `src/app/plugins/importers/facebook_catalog/` | `index.js` — imports Facebook product catalog into `Product` model |

### Services (12 files)

| File | PDV concern |
|------|-------------|
| `services/IntegrationSendOrder.js` | Send order to Pedidos10 |
| `services/Pedidos10Webhook.js` | Process incoming Pedidos10 webhook |
| `services/Pedidos10ChangeOrderStatus.js` | Push order status change to Pedidos10 |
| `services/ProcessPagarmeOrderPaid.js` | Handle PagarMe paid event |
| `services/SendContactToPagarMe.js` | Register contact as PagarMe customer |
| `services/ResetCarts.js` | Warn/close carts with expired WhatsApp window |
| `services/ProcessBackgroundjobCancelOrder.js` | Background: cancel Pedidos10 order |
| `services/ProcessBackgroundjobChargeCreditCard.js` | Background: charge credit card via PagarMe |
| `services/ProcessBackgroundjobGetCreditCard.js` | Background: fetch saved card from PagarMe |
| `services/ProcessBackgroundjobGetPix.js` | Background: generate PIX via PagarMe |
| `services/ProcessBackgroundjobInviteCreditCard.js` | Background: send card invite via PagarMe |
| `services/ProcessWebhookRequest.js` | Dispatch incoming webhooks (Pedidos10-specific routing) |

### Jobs (12 files)

`jobs/Integration10SendOrder.js`, `jobs/Pedidos10ChangeOrderStatus.js`, `jobs/Pedidos10Webhook.js`,
`jobs/ProcessBackgroundjob.js`, `jobs/ProcessBackgroundjobCancelOrder.js`,
`jobs/ProcessBackgroundjobChargeCreditCard.js`, `jobs/ProcessBackgroundjobGetCreditCard.js`,
`jobs/ProcessBackgroundjobGetPix.js`, `jobs/ProcessBackgroundjobInviteCreditCard.js`,
`jobs/ProcessPagarmeOrderPaid.js`, `jobs/ResetCarts.js`, `jobs/SendContactToPagarMe.js`

### Routes (partial files)

| File | Routes to remove |
|------|-----------------|
| `routes/v1/v1-routes.js` | All `/carts/*` (10), `/orders/*` (2), `/integrations` (1) endpoints + their controller imports |
| `routes/resources-routes.js` | `POST /licensees/:id/integration/pagarme`, `POST /licensees/:id/sign-order-webhook` |

### Queries (2 files)

`src/app/queries/BillingQuery.js`, `src/app/queries/IntegrationlogsQuery.js`

### Factories (5 files — test support)

`factories/cart.js`, `factories/order.js`, `factories/product.js`,
`factories/integrationlog.js`, `factories/backgroundjob.js`

### Helpers (partial)

| File | PDV concern |
|------|-------------|
| `helpers/FractionalProducts.js` | Fractional product quantity calculations — only used by cart layer |
| `helpers/ParseTriggerText.js` | Contains `parseCart` function alongside trigger-text parsing; extract non-PDV parts and remove `parseCart` |

---

## Tasks

### Phase 1 — Remove Routes and API Surface

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 1.1 | Remove all `/v1/carts/*` routes, `/v1/orders/*` routes, and `/v1/integrations` route from `v1-routes.js`; delete CartsController, OrdersController, IntegrationsController imports | Pending | `routes/v1/v1-routes.js` | — |
| 1.2 | Remove `POST /licensees/:id/integration/pagarme` and `POST /licensees/:id/sign-order-webhook` from `resources-routes.js` | Pending | `routes/resources-routes.js` | — |
| 1.3 | Remove `sendToPagarMe` and `signOrderWebhook` methods from `LicenseesController.js`; remove PagarMe/Pedidos10 imports | Pending | `controllers/LicenseesController.js` | — |

### Phase 2 — Delete Controllers

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 2.1 | Delete `CartsController.js` and `CartsController.spec.js` | Pending | `controllers/CartsController.js`, `*.spec.js` | 1.1 |
| 2.2 | Delete `OrdersController.js` and `OrdersController.spec.js` | Pending | `controllers/OrdersController.js`, `*.spec.js` | 1.1 |
| 2.3 | Delete `IntegrationsController.js` and `IntegrationsController.spec.js` | Pending | `controllers/IntegrationsController.js`, `*.spec.js` | 1.1 |

### Phase 3 — Delete Services

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 3.1 | Delete Pedidos10 services: `Pedidos10Webhook.js`, `Pedidos10ChangeOrderStatus.js`, `IntegrationSendOrder.js` + specs | Pending | `services/Pedidos10*.js`, `services/IntegrationSendOrder.js` | Phase 2 |
| 3.2 | Delete PagarMe services: `ProcessPagarmeOrderPaid.js`, `SendContactToPagarMe.js` + specs | Pending | `services/ProcessPagarme*.js`, `services/SendContactToPagarMe.js` | Phase 2 |
| 3.3 | Delete background job services: all 5 `ProcessBackgroundjob*.js` payment-related services + specs | Pending | `services/ProcessBackgroundjob{CancelOrder,ChargeCreditCard,GetCreditCard,GetPix,InviteCreditCard}.js` | Phase 2 |
| 3.4 | Delete `services/ResetCarts.js` + spec | Pending | `services/ResetCarts.js` | Phase 2 |
| 3.5 | Delete `services/ProcessWebhookRequest.js` + spec (only used by Pedidos10 integration routing) | Pending | `services/ProcessWebhookRequest.js` | Phase 2 |

### Phase 4 — Delete Jobs

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 4.1 | Delete PDV-specific job files: `Integration10SendOrder.js`, `Pedidos10ChangeOrderStatus.js`, `Pedidos10Webhook.js`, all `ProcessBackgroundjob*.js` payment jobs, `ProcessPagarmeOrderPaid.js`, `ResetCarts.js`, `SendContactToPagarMe.js` | Pending | `jobs/*` (12 files) | Phase 3 |
| 4.2 | Remove PDV job registrations from `jobs/index.js` | Pending | `jobs/index.js` | 4.1 |

### Phase 5 — Delete Plugins

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 5.1 | Delete `plugins/carts/` directory (Alloy, Go2go, Go2goV2, adapters, factory + all specs) | Pending | `plugins/carts/**` (8 source + 8 spec files) | Phase 3 |
| 5.2 | Delete `plugins/payments/` directory (PagarMe + Card/Customer/Payment/Parser/Recipient + all specs) | Pending | `plugins/payments/**` (6 source + 6 spec files) | Phase 3 |
| 5.3 | Delete `plugins/integrations/` directory (IntegratorBase, Pedidos10, Pedidos10/Order, Pedidos10/Parser, factory + all specs) | Pending | `plugins/integrations/**` (5 source + 4 spec files) | Phase 3 |
| 5.4 | Delete `plugins/importers/facebook_catalog/` (Facebook catalog importer + spec) | Pending | `plugins/importers/facebook_catalog/**` | Phase 3 |

### Phase 6 — Delete Models and Repositories

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 6.1 | Delete `models/Cart.js`, `models/Order.js`, `models/Product.js`, `models/Integrationlog.js`, `models/Backgroundjob.js` + their spec files | Pending | `models/{Cart,Order,Product,Integrationlog,Backgroundjob}.js` + specs | Phase 5 |
| 6.2 | Delete corresponding repositories: `repositories/cart.js`, `repositories/order.js`, `repositories/product.js`; also `repositories/integrationlog.js` and `repositories/backgroundjob.js` if created by decouple-mongo plan | Pending | `repositories/{cart,order,product,integrationlog,backgroundjob}.js` | 6.1 |
| 6.3 | Delete queries: `queries/BillingQuery.js`, `queries/IntegrationlogsQuery.js` + specs | Pending | `queries/BillingQuery.js`, `queries/IntegrationlogsQuery.js` | 6.1 |

### Phase 7 — Strip PDV Fields from Core Models

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 7.1 | Remove PDV fields from `Licensee.js` schema: `cartDefault`, `useCartGallabox`, `recipient_id`, `pedidos10_active`, `pedidos10_integration`, `pedidos10_integrator`; update `Licensee.spec.js` and `factories/licensee.js` | Pending | `models/Licensee.js`, `Licensee.spec.js`, `factories/licensee.js` | Phase 6 |
| 7.2 | Remove PDV fields from `Contact.js` schema: `address`, `address_number`, `address_complement`, `neighborhood`, `cep`, `delivery_tax`, `plugin_cart_id`, `address_id`; update `Contact.spec.js` and `factories/contact.js` | Pending | `models/Contact.js`, `Contact.spec.js`, `factories/contact.js` | Phase 6 |

### Phase 8 — Clean Up Helpers, Factories, Routes

| # | Task | Status | Files | Depends On |
|---|------|--------|-------|------------|
| 8.1 | Delete `helpers/FractionalProducts.js` + spec (only used by cart layer) | Pending | `helpers/FractionalProducts.js`, `*.spec.js` | Phase 5 |
| 8.2 | Remove `parseCart` function from `helpers/ParseTriggerText.js`; update spec; verify no remaining callers | Pending | `helpers/ParseTriggerText.js` | Phase 5 |
| 8.3 | Delete PDV test factories: `factories/cart.js`, `factories/order.js`, `factories/product.js`, `factories/integrationlog.js`, `factories/backgroundjob.js` | Pending | `factories/*.js` (5 files) | Phase 6 |
| 8.4 | Grep entire codebase for any remaining imports of deleted modules; fix or remove each one | Pending | — | Phases 1–7 |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Features still in production use | Run Phase 1 first and monitor traffic — 0 requests to removed routes confirms safe to proceed |
| MongoDB collections still have data | Remove collections only after confirming no production traffic; provide migration script to archive before drop |
| `Backgroundjob` model may have non-PDV uses | Verify: if all consumers are payment/order related, delete; otherwise keep model but remove payment-specific job types |
| `ProcessWebhookRequest.js` may receive non-Pedidos10 webhooks | Check `IntegrationsController.js` usage and `process-webhook-request` queue consumers before deleting |
| `ParseTriggerText.js` has non-PDV functions alongside `parseCart` | Only delete `parseCart`, not the entire file |
| PagarMe `Recipient` is created on `LicenseesController.sendToPagarMe` | After removing the route (1.2), recipients can no longer be created; confirm this is intentional |
| `Contact.address*` fields used outside cart layer | Run grep to confirm before removing from schema in 7.2 |

---

## Done When

- [ ] `grep -r "CartRepository\|Cart\|Order\|Product\|Integrationlog\|Backgroundjob\|PagarMe\|Pedidos10\|Alloy\|Go2go" src/` returns only non-PDV matches
- [ ] `routes/v1/v1-routes.js` has no cart/order/integration routes
- [ ] `Licensee.js` schema has no `cartDefault`, `recipient_id`, `pedidos10_*` fields
- [ ] `Contact.js` schema has no delivery/address fields
- [ ] All deleted files have no remaining importers in the codebase
- [ ] Remaining tests still pass (target: 2611 minus deleted test count)
