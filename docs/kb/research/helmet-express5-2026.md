# Research: Helmet 8.x + Express 5 — 2026

**Date**: 2026-05-14
**Purpose**: Pre-implementation research for security-hardening/phase-1/task-01-helmet-cors
**Helmet version**: 8.1.0 | **Express version**: 5.2.1 | **Node version**: 24.x

---

## Compatibility

**Helmet 8.x is fully compatible with Express 5.** Helmet is framework-agnostic — it only sets HTTP response headers and calls `next()`. All Helmet middleware is synchronous; none of Express 5's breaking changes (async propagation, read-only `req.query`, etc.) affect it.

**Minimum Node.js for Helmet 8.x**: Node 18. This repo is on Node 24 — satisfied.

---

## Latest Version

**Helmet 8.1.0** (released 2025-03-17)

```bash
npm show helmet version  # verify before installing
yarn add helmet@8.1.0
```

---

## Helmet 8 Breaking Changes from v7

| Change | Details |
|---|---|
| HSTS `maxAge` default | 180 days → **365 days** (31536000 s) |
| CSP unquoted values | `"self"` (no quotes) → **throws at startup**. Must use `"'self'"` |
| `getDefaultDirectives()` | Now returns deep copy (not mutable reference) |
| `includeSubDomains` misspelling | Now throws instead of warning |
| `crossOriginEmbedderPolicy` | **Disabled by default** (was enabled in v7) |

---

## All Default Headers

| Header | Default Value | Critical? |
|---|---|---|
| `Content-Security-Policy` | See CSP section | Yes — primary XSS defense |
| `Cross-Origin-Opener-Policy` | `same-origin` | Yes |
| `Cross-Origin-Resource-Policy` | `same-origin` | Yes |
| `Cross-Origin-Embedder-Policy` | disabled by default | Situational |
| `Referrer-Policy` | `no-referrer` | Yes |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Yes (HTTPS only) |
| `X-Content-Type-Options` | `nosniff` | Yes |
| `X-Frame-Options` | `SAMEORIGIN` | Yes |
| `X-Powered-By` | removed | Yes — hides framework fingerprint |
| `X-XSS-Protection` | `0` (disabled) | Yes — modern browsers ignore it; enabling can cause vulnerabilities |
| `Origin-Agent-Cluster` | `?1` | Low |
| `X-DNS-Prefetch-Control` | `off` | Low |
| `X-Download-Options` | `noopen` | Low — IE-specific |
| `X-Permitted-Cross-Domain-Policies` | `none` | Low — Flash-era |

---

## Recommended Configuration

This app serves both API routes and a React SPA (Vite build). Also uses Socket.IO (WebSocket connections).

### `src/config/security.js` (new file)

```js
const isDev = process.env.NODE_ENV !== 'production'

export function helmetConfig() {
  return {
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'script-src-attr': ["'none'"],
        'style-src': ["'self'", 'https:', "'unsafe-inline'"],  // Vite injects styles
        'img-src': ["'self'", 'data:', 'blob:'],
        'font-src': ["'self'", 'https:', 'data:'],
        // Socket.IO WebSocket connections
        'connect-src': [
          "'self'",
          isDev ? 'ws://localhost:*' : null,
          isDev ? 'http://localhost:*' : null,
        ].filter(Boolean),
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"],
        // Safari on macOS upgrades http://localhost to https://localhost when this
        // directive is present — breaks local dev entirely
        'upgrade-insecure-requests': isDev ? null : [],
      },
    },
    // HSTS only meaningful over HTTPS; skip in dev
    strictTransportSecurity: isDev
      ? false
      : { maxAge: 31536000, includeSubDomains: true },
    // crossOriginEmbedderPolicy disabled by default in Helmet 8
    // Only enable if SharedArrayBuffer is needed
    crossOriginEmbedderPolicy: false,
  }
}
```

### Integration in `src/config/http.js`

```js
import helmet from 'helmet'
import { helmetConfig } from './security.js'

const app = express()

// Helmet FIRST — before static, cors, and routes
app.use(helmet(helmetConfig()))

// then: express.json, express.urlencoded, morgan, static, cors, routes...
```

---

## Middleware Ordering (Critical)

Helmet must be registered **before**:
- `express.static()` — to add security headers to static assets
- `cors()` — to avoid header conflicts
- `routes(app)` — so all route responses get the headers

---

## Express 5 Specific Gotchas

1. **No async issues** — all Helmet middleware is synchronous
2. **`upgrade-insecure-requests` + dev** — Safari upgrades `http://localhost` → breaks local dev; always gate with `NODE_ENV`
3. **CSP strict validation** — `"self"` (no inner quotes) throws at startup in Helmet 8. Must be `"'self'"`
4. **Null directive values** — setting a directive to `null` removes it from the policy (intentional behavior)
5. **`crossOriginEmbedderPolicy` disabled by default** — if v7 behavior relied on it being enabled, re-enable explicitly

---

## Bull Board CSP Note

`/queue` uses `@bull-board/express` which renders its own UI with bundled assets. If CSP is applied globally, Bull Board's route may need relaxed `script-src`/`style-src` overrides. Check after implementation:

```js
// Possible override for Bull Board route if CSP blocks its UI assets
app.use('/queue', helmet({ contentSecurityPolicy: false }), bullBoardMiddleware)
```

---

## CORS + CORP Interaction

Helmet's `Cross-Origin-Resource-Policy: same-origin` and an open `cors()` (no origin allowlist) will conflict conceptually. The CORS config in `src/config/cors.js` should be addressed alongside Helmet (handled by task-09).

---

## Production CSP for Socket.IO

Add the production WebSocket URL to `connect-src`:

```js
'connect-src': ["'self'", 'wss://your-domain.com'],
```

This must be configured via env var or known domain before going live.
