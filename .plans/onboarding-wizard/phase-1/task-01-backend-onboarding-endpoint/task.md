# Task: Backend Onboarding Endpoint

**Plan**: Onboarding Wizard
**Phase**: 1
**Task ID (phase-local)**: task-01
**Task Path**: phase-1/task-01-backend-onboarding-endpoint
**Depends On**: None
**JIRA**: N/A

## Objective

Create a public `POST /onboarding` endpoint that accepts licensee identity fields and user credentials, creates both records in sequence (with cleanup on partial failure), and returns the created pair. The endpoint requires no auth token and is rate-limited.

## Context

Both `POST /resources/licensees` and `POST /resources/users` require `authorize('super')` (see `src/app/routes/resources-routes.ts` lines 127 and 132), so onboarding cannot call those routes. This task introduces a parallel public endpoint on the same public router as login (`src/app/routes/login-route.ts`).

**Field constraints (from Mongoose models)**:
- Licensee required: `name` (≥4 chars), `licenseKind` ('demo'|'free'|'paid'), `email`, `phone`, `document`, `kind` ('individual'|'company'|'')
- User required: `name` (≥4 chars), `email` (unique), `password` (≥8 chars); `licensee` optional when `role='admin'`

**DI pattern**: Use cases take repositories as constructor dependencies. See `src/app/usecases/licensees/CreateLicensee.ts` and `src/app/usecases/auth/AuthenticateUser.ts` for the established pattern.

**Rate limiting**: Reuse the `rateLimit` + `RedisStore` pattern from `login-route.ts` lines 12–25.

**licenseKind**: Lock to `'demo'` inside the use case regardless of what the client sends. The frontend will display it as read-only.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify no existing `/onboarding` route exists: `grep -r "onboarding" src/app/routes/`
- [ ] Read `src/app/usecases/licensees/CreateLicensee.ts` — understand `pickFields` helper and field whitelist
- [ ] Read `src/app/usecases/users/CreateUser.ts` — understand user creation pattern
- [ ] Read `src/app/routes/login-route.ts` — understand public router and rate limiter setup
- [ ] Read `src/app/usecases/auth/AuthenticateUser.spec.ts` — understand backend spec patterns (factories, memory repos, describe/it structure)
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/usecases/onboarding/OnboardAccount.ts` | create | Core use case |
| `src/app/usecases/onboarding/OnboardAccount.spec.ts` | create | Unit tests using memory repos and factories |
| `src/app/controllers/OnboardingController.ts` | create | Thin HTTP adapter; validates required fields, calls use case |
| `src/app/routes/login-route.ts` | modify | Add `POST /onboarding` with its own rate limiter |

### Do NOT Modify

- `src/app/routes/resources-routes.ts` — protected routes, no changes needed
- `src/app/usecases/licensees/CreateLicensee.ts` — reuse pattern only, do not modify
- `src/app/usecases/users/CreateUser.ts` — reuse pattern only, do not modify

## Implementation Steps

### Step 1: Create `OnboardAccount` use case

Create `src/app/usecases/onboarding/OnboardAccount.ts`.

The use case:
- Receives `{ licensee: LicenseeFields, user: UserFields }` (or flat fields — choose flat for simplicity, mirroring `CreateLicensee`)
- Whitelists licensee fields: `name`, `email`, `phone`, `document`, `kind`; forces `licenseKind: 'demo'` and `active: true`
- Creates the licensee via `this.licenseeRepository.create(licenseePayload)`
- If licensee creation throws, re-throws immediately
- Whitelists user fields: `name`, `email`, `password`; forces `role: 'admin'`, `active: true`, sets `licensee: createdLicensee._id`
- Creates the user via `this.userRepository.create(userPayload)`
- If user creation throws, deletes the orphaned licensee (`await this.licenseeRepository.delete(createdLicensee._id)`), then re-throws
- Returns `{ licensee: createdLicensee, user: createdUser }`

Constructor signature:
```ts
constructor({ licenseeRepository, userRepository }: { licenseeRepository: any; userRepository: any })
```

### Step 2: Create `OnboardingController`

Create `src/app/controllers/OnboardingController.ts`.

The controller:
- `validations()` method returns an array of express-validator checks for required fields:
  - `name` (not empty), `email` (is email), `phone` (not empty), `document` (not empty), `kind` (not empty)
  - `userName` (not empty), `userEmail` (is email), `password` (length ≥ 8)
  - Or keep field names separate per object: `licensee.name`, `user.name`, etc. — choose the flat naming approach for simplicity
- `onboard` handler:
  - Checks `validationResult(req)` and returns 400 on validation errors
  - Calls `this.onboardAccount.execute(req.body)`
  - On success, returns 201 with `{ licensee, user: { ...user, password: undefined } }`
  - Catches errors and returns 400 with `{ message: error.message }`

Field naming on the request body (flat):
```json
{
  "licenseeName": "...", "kind": "...", "document": "...", "licenseeEmail": "...", "phone": "...",
  "userName": "...", "userEmail": "...", "password": "..."
}
```
The use case unpacks `licenseeName → name`, `licenseeEmail → email`, `userName → name`, `userEmail → email` internally to avoid field collisions.

### Step 3: Wire into `login-route.ts`

Add to `src/app/routes/login-route.ts`:

1. Import `OnboardingController`, `LicenseeRepositoryDatabase`, `UserRepositoryDatabase`
2. Create a second rate limiter `onboardingLimiter` with `limit: 5` and `windowMs: 60 * 60 * 1000` (5 per hour, tighter than login)
3. Instantiate the use case and controller
4. Add: `router.post('/onboarding', onboardingLimiter, onboardingController.validations(), onboardingController.onboard)`

### Step 4: Write unit tests

Create `src/app/usecases/onboarding/OnboardAccount.spec.ts`.

Tests (use `LicenseeRepositoryMemory` and `UserRepositoryMemory`, and existing factories):
- Successfully creates both licensee and user; returns `{ licensee, user }`
- Forces `licenseKind: 'demo'` regardless of input
- Forces user `role: 'admin'`; links `user.licensee` to `createdLicensee._id`
- If user creation fails, deletes the orphaned licensee and re-throws
- Strips password from returned user (if use case handles this — otherwise this is a controller concern)

## Testing

- [ ] `OnboardAccount.spec.ts` passes: happy path, forced licenseKind, forced admin role, orphan cleanup on user failure
- [ ] Manual curl test: `curl -X POST http://localhost:5001/login/onboarding -H "Content-Type: application/json" -d '{...}'` returns 201
- [ ] Rate limiter: 6th request within 1 hour returns 429
- [ ] `npx jest src/app/usecases/onboarding` passes
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB/doc updates required — pattern mirrors existing use cases; nothing non-obvious introduced
- [ ] If `delete` method is missing on any repository memory implementation (needed for orphan cleanup), add it and note in status.md

## Completion Criteria

- [ ] `POST /onboarding` route exists and responds correctly
- [ ] Use case cleans up orphaned licensee on user creation failure
- [ ] `licenseKind` is always `'demo'`; user is always `role: 'admin'`
- [ ] All specs pass
- [ ] `pre-commit-check` passes
- [ ] Changes committed to `plan/onboarding-wizard/phase-1/task-01-backend-onboarding-endpoint`
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

No parallel tasks in this phase.
