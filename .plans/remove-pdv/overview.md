# Plan: Remove PDV Domain

**Status**: not-started
**Created**: 2026-04-02
**Last Updated**: 2026-04-28
**Assigned Dev**: Alan
**Master Plan**: None

## Objective

Remove the PDV (Ponto de Venda / Point of Sale) layer entirely from the codebase: delete all associated models, repositories, controllers, plugins, services, jobs, queries, factories, and routes. Strip PDV-specific fields from the core `Licensee` and `Contact` models.

## Scope

### In Scope
- Remove all PDV API routes (carts, orders, integrations, PagarMe, Pedidos10 licensee endpoints)
- Delete PDV controllers: `CartsController`, `OrdersController`, `IntegrationsController`
- Remove PDV methods from `LicenseesController`
- Delete all PDV services (Pedidos10, PagarMe, background job payment services, ResetCarts, ProcessWebhookRequest)
- Delete all PDV jobs and remove their registrations
- Delete all PDV plugins (carts, payments, integrations, facebook catalog importer)
- Delete PDV models and repositories (Cart, Order, Product, Integrationlog, Backgroundjob)
- Delete PDV queries (BillingQuery, IntegrationlogsQuery)
- Strip PDV fields from `Licensee` and `Contact` schemas
- Delete PDV test factories and helpers (`FractionalProducts`, `parseCart` from `ParseTriggerText`)
- Verify no remaining PDV imports after all phases

### Out of Scope
- Migrating or replacing PDV functionality — {feature is being removed, not replaced}
- `ParseTriggerText.js` non-PDV functions — {only `parseCart` is removed, file is otherwise preserved}

## Kill Criteria

- If any PDV route still receives production traffic after Phase 1 is merged — stop and investigate before proceeding.
- If Cart, Order, or Backgroundjob collections still have active production data when Phase 6 is about to run — do not proceed until data is archived or confirmed inactive.

## Phases

| Phase | Name | Tasks | Dependencies | Description |
|-------|------|-------|--------------|-------------|
| 1 | Remove Routes and API Surface | task-01, task-02, task-03 | None | Remove PDV route registrations and PDV methods from LicenseesController |
| 2 | Delete Controllers | task-04, task-05, task-06 | Phase 1 | Delete the three PDV controllers and their specs |
| 3 | Delete Services | task-07, task-08, task-09, task-10, task-11 | Phase 2 | Delete all 12 PDV service files and their specs |
| 4 | Delete Jobs | task-12, task-13 | Phase 3 | Delete PDV job files and clean up job registrations |
| 5 | Delete Plugins | task-14, task-15, task-16, task-17 | Phase 3 | Delete cart, payment, integration plugins and facebook catalog importer |
| 6 | Delete Models and Repositories | task-18, task-19 | Phase 5 | Delete PDV models, repositories, and queries |
| 7 | Strip PDV Fields from Core Models | task-20, task-21 | Phase 6 | Remove PDV fields from Licensee and Contact schemas |
| 8 | Clean Up Helpers, Factories, Routes | task-22, task-23, task-24, task-25 | Phases 1–7 | Delete helpers/factories, remove parseCart, verify no remaining imports |

## Task Summary

| Task Path | Title | Phase | Status | Depends On |
|-----------|-------|-------|--------|------------|
| phase-1/task-01-remove-pdv-routes-v1 | Remove PDV routes from v1-routes.js | 1 | not-started | — |
| phase-1/task-02-remove-pagarme-pedidos10-routes-resources | Remove PagarMe and Pedidos10 routes from resources-routes.js | 1 | not-started | — |
| phase-1/task-03-remove-licensees-controller-pdv-methods | Remove sendToPagarMe and signOrderWebhook from LicenseesController | 1 | not-started | — |
| phase-2/task-04-delete-carts-controller | Delete CartsController and its spec | 2 | not-started | phase-1/task-01-remove-pdv-routes-v1 |
| phase-2/task-05-delete-orders-controller | Delete OrdersController and its spec | 2 | not-started | phase-1/task-01-remove-pdv-routes-v1 |
| phase-2/task-06-delete-integrations-controller | Delete IntegrationsController and its spec | 2 | not-started | phase-1/task-01-remove-pdv-routes-v1 |
| phase-3/task-07-delete-pedidos10-services | Delete Pedidos10Webhook, Pedidos10ChangeOrderStatus, IntegrationSendOrder services | 3 | not-started | phase-2/task-04-delete-carts-controller, phase-2/task-05-delete-orders-controller, phase-2/task-06-delete-integrations-controller |
| phase-3/task-08-delete-pagarme-services | Delete ProcessPagarmeOrderPaid and SendContactToPagarMe services | 3 | not-started | phase-2/task-04-delete-carts-controller, phase-2/task-05-delete-orders-controller, phase-2/task-06-delete-integrations-controller |
| phase-3/task-09-delete-backgroundjob-payment-services | Delete all 5 ProcessBackgroundjob payment services | 3 | not-started | phase-2/task-04-delete-carts-controller, phase-2/task-05-delete-orders-controller, phase-2/task-06-delete-integrations-controller |
| phase-3/task-10-delete-reset-carts-service | Delete ResetCarts service | 3 | not-started | phase-2/task-04-delete-carts-controller, phase-2/task-05-delete-orders-controller, phase-2/task-06-delete-integrations-controller |
| phase-3/task-11-delete-process-webhook-request-service | Delete ProcessWebhookRequest service | 3 | not-started | phase-2/task-04-delete-carts-controller, phase-2/task-05-delete-orders-controller, phase-2/task-06-delete-integrations-controller |
| phase-4/task-12-delete-pdv-jobs | Delete 12 PDV job files | 4 | not-started | phase-3/task-07-delete-pedidos10-services, phase-3/task-08-delete-pagarme-services, phase-3/task-09-delete-backgroundjob-payment-services, phase-3/task-10-delete-reset-carts-service, phase-3/task-11-delete-process-webhook-request-service |
| phase-4/task-13-remove-pdv-job-registrations | Remove PDV job registrations from jobs/index.js | 4 | not-started | phase-4/task-12-delete-pdv-jobs |
| phase-5/task-14-delete-cart-plugins | Delete plugins/carts/ directory | 5 | not-started | phase-3/task-07-delete-pedidos10-services, phase-3/task-08-delete-pagarme-services, phase-3/task-09-delete-backgroundjob-payment-services, phase-3/task-10-delete-reset-carts-service, phase-3/task-11-delete-process-webhook-request-service |
| phase-5/task-15-delete-payment-plugins | Delete plugins/payments/ directory | 5 | not-started | phase-3/task-07-delete-pedidos10-services, phase-3/task-08-delete-pagarme-services, phase-3/task-09-delete-backgroundjob-payment-services, phase-3/task-10-delete-reset-carts-service, phase-3/task-11-delete-process-webhook-request-service |
| phase-5/task-16-delete-integration-plugins | Delete plugins/integrations/ directory | 5 | not-started | phase-3/task-07-delete-pedidos10-services, phase-3/task-08-delete-pagarme-services, phase-3/task-09-delete-backgroundjob-payment-services, phase-3/task-10-delete-reset-carts-service, phase-3/task-11-delete-process-webhook-request-service |
| phase-5/task-17-delete-facebook-catalog-importer | Delete plugins/importers/facebook_catalog/ | 5 | not-started | phase-3/task-07-delete-pedidos10-services, phase-3/task-08-delete-pagarme-services, phase-3/task-09-delete-backgroundjob-payment-services, phase-3/task-10-delete-reset-carts-service, phase-3/task-11-delete-process-webhook-request-service |
| phase-6/task-18-delete-pdv-models-repositories | Delete PDV models and repositories | 6 | not-started | phase-5/task-14-delete-cart-plugins, phase-5/task-15-delete-payment-plugins, phase-5/task-16-delete-integration-plugins, phase-5/task-17-delete-facebook-catalog-importer |
| phase-6/task-19-delete-pdv-queries | Delete BillingQuery and IntegrationlogsQuery | 6 | not-started | phase-6/task-18-delete-pdv-models-repositories |
| phase-7/task-20-strip-licensee-pdv-fields | Remove PDV fields from Licensee schema | 7 | not-started | phase-6/task-18-delete-pdv-models-repositories, phase-6/task-19-delete-pdv-queries |
| phase-7/task-21-strip-contact-pdv-fields | Remove PDV fields from Contact schema | 7 | not-started | phase-6/task-18-delete-pdv-models-repositories, phase-6/task-19-delete-pdv-queries |
| phase-8/task-22-delete-fractional-products-helper | Delete FractionalProducts helper | 8 | not-started | phase-5/task-14-delete-cart-plugins |
| phase-8/task-23-remove-parsecart-from-parse-trigger-text | Remove parseCart from ParseTriggerText helper | 8 | not-started | phase-5/task-14-delete-cart-plugins |
| phase-8/task-24-delete-pdv-factories | Delete PDV test factories | 8 | not-started | phase-6/task-18-delete-pdv-models-repositories |
| phase-8/task-25-verify-no-remaining-pdv-imports | Grep codebase for remaining PDV imports and fix | 8 | not-started | phase-7/task-20-strip-licensee-pdv-fields, phase-7/task-21-strip-contact-pdv-fields, phase-8/task-22-delete-fractional-products-helper, phase-8/task-23-remove-parsecart-from-parse-trigger-text, phase-8/task-24-delete-pdv-factories |

## Branch Convention

Pattern: `plan/remove-pdv/phase-{N}/task-{NN}-{slug}`
Base branch: `main`

## Key Files

| File/Directory | Relevance |
|----------------|-----------|
| `src/app/routes/v1/v1-routes.js` | Primary PDV API surface (carts, orders, integrations routes) |
| `src/app/routes/resources-routes.js` | Licensee PDV endpoints (pagarme, sign-order-webhook) |
| `src/app/controllers/` | Three full PDV controllers + PDV methods in LicenseesController |
| `src/app/services/` | 12 PDV service files |
| `src/app/jobs/` | 12 PDV job files |
| `src/app/plugins/` | carts/, payments/, integrations/, importers/facebook_catalog/ |
| `src/app/models/` | Cart, Order, Product, Integrationlog, Backgroundjob + Licensee/Contact PDV fields |

## Defects

| Defect Task | Title | Found During | Blocks | Status |

## Risks

- Features still in production use — Run Phase 1 first and monitor traffic; zero requests to removed routes confirms safe to proceed
- MongoDB collections still have data — Remove collections only after confirming no production traffic; archive data before dropping
- `Backgroundjob` model may have non-PDV uses — Verify all consumers are payment/order related before deleting; if not, keep model but remove payment-specific job types
- `ProcessWebhookRequest.js` may receive non-Pedidos10 webhooks — Check `IntegrationsController.js` usage and queue consumers before deleting
- `ParseTriggerText.js` has non-PDV functions alongside `parseCart` — Only delete `parseCart`, not the entire file
- `Contact.address*` fields may be used outside cart layer — Run grep to confirm before removing from schema in Phase 7

## Success Criteria

- [ ] No PDV imports remain in the codebase (grep for Cart, Order, Product, Integrationlog, Backgroundjob, PagarMe, Pedidos10, Alloy, Go2go returns only non-PDV matches)
- [ ] `routes/v1/v1-routes.js` has no cart/order/integration routes
- [ ] `Licensee.js` schema has no `cartDefault`, `recipient_id`, `pedidos10_*` fields
- [ ] `Contact.js` schema has no delivery/address fields
- [ ] All deleted files have no remaining importers in the codebase
- [ ] All tests pass
- [ ] No regressions in existing functionality
