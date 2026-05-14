# Research: express-validator v7 for v1 API Routes — 2026

**Date**: 2026-05-14
**Purpose**: Pre-implementation research for security-hardening/phase-2/task-08-v1-input-validation
**Version in use**: express-validator 7.3.2 (already installed)

---

## Existing Project Pattern (Must Match)

The project already uses express-validator in `LicenseesController.js` and `ContactsController.js`. **Match this pattern exactly.**

### Pattern: `validations()` method on controller + `sanitizeExpressErrors`

```js
// Controller class:
validations() {
  return [
    check('email', 'Email deve ser preenchido com um valor válido')
      .optional({ checkFalsy: true })
      .isEmail()
      .normalizeEmail(),
  ]
}

async create(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: sanitizeExpressErrors(errors.array()) })
  }
  // ... handler logic
}
```

```js
// Route file:
router.post('/licensees', licenseesController.validations(), licenseesController.create)
```

**CRITICAL**: `validations()` must be a **factory function** (returns new array each call), never a bare module-level array. express-validator chains are mutable — sharing a reference across routes mutates all of them.

---

## Standard Validation Check Inside Handler

```js
import { validationResult } from 'express-validator'
import { sanitizeExpressErrors } from '../helpers/SanitizeErrors.js'

async create(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: sanitizeExpressErrors(errors.array()) })
  }
  // proceed...
}
```

**422 response shape** (from `sanitizeExpressErrors`):
```json
{
  "errors": [
    { "message": "contact é obrigatório" },
    { "message": "products não pode ser vazio" }
  ]
}
```

---

## Import Style

```js
import { body, param, query, validationResult } from 'express-validator'
import { sanitizeExpressErrors } from '../helpers/SanitizeErrors.js'
```

Prefer explicit `body()`, `param()`, `query()` over `check()` — the v7 docs no longer feature `check()` prominently and explicit location is clearer.

---

## Common Validators

| Type | Chain |
|---|---|
| Required string | `body('field').notEmpty().withMessage('field é obrigatório').isString()` |
| Required, trimmed | `body('field').trim().notEmpty().withMessage('field é obrigatório')` |
| Optional string | `body('field').optional().isString().trim()` |
| Optional, skip if falsy | `body('field').optional({ checkFalsy: true }).isString()` |
| MongoDB ObjectId | `body('id').isMongoId().withMessage('id deve ser um ObjectId válido')` |
| Integer (non-negative) | `param('time').isInt({ min: 0 }).withMessage('time deve ser um inteiro não negativo')` |
| Array (non-empty) | `body('products').isArray({ min: 1 }).withMessage('products deve ser um array não vazio')` |
| Array item field | `body('products.*.id').isMongoId()` |

---

## Express 5 Caveats

1. **`req.body` is `undefined` if not parsed** (Express 5 changed from `{}`). Confirm `express.json()` is mounted before v1 routes.
2. **`req.params` has null prototype** — does not affect express-validator; it accesses fields by name.
3. **`req.query` is not writable** — if sanitizers like `.trim()` are applied to `query()` chains, read the sanitized value via `matchedData(req)` not `req.query.field`.
4. **Async custom validators** — rejected promises auto-propagate to error handler in Express 5 (benefit, not a risk).

---

## Target Route Implementations

### `POST /carts`

Controller falls back from `body.contact` to `query.contact` — both optional at validation layer:

```js
validationsCreate() {
  return [
    body('contact').optional().isString().trim(),
    query('contact').optional().isString().trim(),
    body('name').optional().isString().trim(),
  ]
}
```

### `POST /carts/:contact/item`

```js
validationsAddItem() {
  return [
    param('contact').notEmpty().withMessage('contact é obrigatório').isString().trim(),
    body('products').isArray({ min: 1 }).withMessage('products deve ser um array com pelo menos um item'),
  ]
}
```

### `POST /orders`

```js
validations() {
  return [
    body('MerchantExternalCode')
      .notEmpty()
      .withMessage('MerchantExternalCode é obrigatório')
      .isString()
      .trim(),
    body('order').notEmpty().withMessage('order é obrigatório'),
  ]
}
```

### `GET|POST /delay/:time`

`DelayController` doesn't use a class-based `validations()` — use a factory export:

```js
export const delayValidations = () => [
  param('time')
    .isInt({ min: 0 })
    .withMessage('time deve ser um inteiro não negativo'),
]

// Route wiring:
router.get('/delay/:time', delayValidations(), delayController.time)
router.post('/delay/:time', delayValidations(), delayController.time)
```

---

## Route Wiring in `v1-routes.js`

```js
router.post('/carts', cartsController.validationsCreate(), cartsController.create)
router.post('/carts/:contact/item', cartsController.validationsAddItem(), cartsController.addItem)
router.post('/orders', ordersController.validations(), ordersController.create)
router.get('/delay/:time', delayValidations(), delayController.time)
router.post('/delay/:time', delayValidations(), delayController.time)
```

---

## Key Files

- `src/app/routes/v1/v1-routes.js` — route file to update
- `src/app/helpers/SanitizeErrors.js` — `sanitizeExpressErrors` helper
- `src/app/controllers/LicenseesController.js` — reference implementation of `validations()` pattern
- `src/app/controllers/ContactsController.js` — reference implementation
- `src/app/routes/resources-routes.js` — reference for route wiring with `validations()`
