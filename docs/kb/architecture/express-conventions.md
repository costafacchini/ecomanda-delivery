# Express Conventions

**Last Updated**: 2026-03-29
**Context**: When working with Express routes, middleware, or configuration

## Architecture
- Separate routes, controllers, services, and models
- Routes define endpoints, controllers handle request/response, services contain business logic
- Use `express.Router()` for route modules
- Error handling middleware at the end of the middleware chain

## Middleware
- Order matters — middleware runs in registration order
- Always call `next()` or send a response — hanging requests = memory leaks
- Use `express.json()` and `express.urlencoded()` for body parsing
- Auth middleware before route handlers, logging middleware first

## Routes
- RESTful naming: `GET /users`, `POST /users`, `GET /users/:id`, `PUT /users/:id`, `DELETE /users/:id`
- Validate input with `zod`, `joi`, or `express-validator` at the route level
- Always return proper HTTP status codes (201 for created, 204 for no content, 404, 422, etc.)
- Use async route handlers with error catching wrapper

## Error Handling
- Custom error classes with status codes
- Global error handler: `app.use((err, req, res, next) => { ... })`
- Never expose stack traces in production
- Use `express-async-errors` or wrap async handlers to catch rejected promises

## Common Pitfalls
- Forgetting `return` after `res.send()` — code continues executing
- Not calling `next(err)` in async middleware — errors silently disappear
- Trust proxy: set `app.set('trust proxy', 1)` behind reverse proxy for correct `req.ip`
- `req.params` values are always strings — parse to numbers explicitly
- CORS: use `cors` middleware, don't manually set headers
