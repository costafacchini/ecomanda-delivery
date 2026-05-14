# Task: Input Validation on v1 API Routes

**Plan**: Security Hardening
**Phase**: 2
**Task ID (phase-local)**: task-08
**Task Path**: phase-2/task-08-v1-input-validation
**Depends On**: None
**JIRA**: N/A

## Objective

Add express-validator input validation to the highest-risk v1 API routes: `/carts`, `/orders`, and `/integrations`. Reject malformed requests with 422 before they reach controllers.

## Context

`src/app/routes/v1/v1-routes.js` mounts all v1 routes. None have express-validator middleware today.

`express-validator` is already in `package.json` (v7.3.2) — no new dependency needed.

Focus on routes that accept `req.body` with structured data:
- `POST /carts` — creates a cart; requires `contact` (phone number format)
- `POST /carts/:contact/item` — adds an item; requires `productId`, `quantity`
- `POST /orders` — creates a Pedidos10 order; requires `pedido` object
- `POST /integrations` — creates an integration log; requires structured body
- `GET /delay/:time` — time param should be a positive integer (already uses `parseInt`, but no range guard)

Do NOT attempt to add validation to every v1 route in this task — that would be too large. Prioritise the routes listed above. Leave the rest for a follow-up.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Read `src/app/controllers/CartsController.js` to understand what fields `create` and `addItem` expect
- [ ] Read `src/app/controllers/OrdersController.js` to understand `create` fields
- [ ] Read `src/app/controllers/IntegrationsController.js` to understand `create` fields
- [ ] Check existing express-validator usage in `src/app/controllers/UsersController.js` for the validation pattern to follow
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/routes/v1/v1-routes.js` | modify | Add validation middleware to targeted routes |

### Do NOT Modify

- `src/app/routes/resources-routes.js` — owned by task-07
- `src/app/routes/api-routes.js` — owned by task-06
- `src/config/http.js` — owned by task-05
- Any controller files — validation belongs in route middleware, not controllers

## Implementation Steps

### Step 1: Review existing validation pattern

Read `src/app/controllers/UsersController.js` `validations()` method. Follow the same pattern using `body()` from `express-validator` and a `validationResult` check.

Create a reusable `validate` helper at the top of `v1-routes.js` (or import from a shared util if one exists):

```js
import { body, param, validationResult } from 'express-validator'

function validate(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }
  next()
}
```

### Step 2: Add validation to POST /carts

```js
router.post(
  '/carts',
  body('contact').notEmpty().withMessage('contact é obrigatório'),
  validate,
  cartsController.create
)
```

### Step 3: Add validation to POST /carts/:contact/item

Check `CartsController.addItem` for required fields. At minimum:

```js
router.post(
  '/carts/:contact/item',
  param('contact').notEmpty(),
  body('quantity').isInt({ min: 1 }).withMessage('quantity deve ser um inteiro positivo'),
  validate,
  cartsController.addItem
)
```

### Step 4: Add validation to POST /orders

```js
router.post(
  '/orders',
  body('pedido').notEmpty().withMessage('pedido é obrigatório'),
  validate,
  ordersController.create
)
```

### Step 5: Add range guard to GET|POST /delay/:time

```js
router.get(
  '/delay/:time',
  param('time').isInt({ min: 0, max: 30000 }).withMessage('time deve ser um inteiro entre 0 e 30000'),
  validate,
  delayController.time
)
router.post('/delay/:time', param('time').isInt({ min: 0, max: 30000 }), validate, delayController.time)
```

## Testing

- [ ] `npx jest` — all existing tests pass
- [ ] Write tests for each new validation:
  - `POST /carts` without `contact` → 422
  - `POST /carts/:contact/item` with `quantity: 0` → 422
  - `POST /orders` without `pedido` → 422
  - `GET /delay/99999` → 422
  - Valid requests → proceed to controller
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB doc required — express-validator pattern already used in resources routes

## Completion Criteria

- [ ] Targeted v1 routes return 422 on invalid input before reaching controllers
- [ ] All tests pass (existing + new)
- [ ] Changes committed to `plan/security-hardening/phase-2/task-08-v1-input-validation`
- [ ] `status.md` updated to `complete`
