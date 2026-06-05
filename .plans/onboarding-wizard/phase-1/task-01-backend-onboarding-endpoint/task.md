# Task: Backend Onboarding Endpoint

**Plan**: Onboarding Wizard
**Phase**: 1
**Task ID (phase-local)**: task-01
**Task Path**: phase-1/task-01-backend-onboarding-endpoint
**Depends On**: None
**JIRA**: N/A

## Objective

Create a public `POST /onboarding` endpoint that accepts licensee identity + optional chat/WhatsApp integration fields + user credentials, creates both records in sequence (with cleanup on partial failure), and returns the created pair. The endpoint requires no auth token and is rate-limited.

## Context

Both `POST /resources/licensees` and `POST /resources/users` require `authorize('super')` (`src/app/routes/resources-routes.ts` lines 127, 132) — onboarding cannot call those. This task introduces a new public route on the same router as login (`src/app/routes/login-route.ts`).

**Field constraints (from Mongoose models)**:
- Licensee required: `name` (≥4 chars), `licenseKind` (forced `'demo'` server-side), `email`, `phone`, `document`, `kind` ('individual'|'company')
- Licensee optional integration fields: `chatDefault`, `chatUrl`, `chatIdentifier`, `chatKey`, `whatsappDefault`, `whatsappToken`, `whatsappUrl`
- User required: `name` (≥4 chars), `email` (unique), `password` (≥8 chars); role forced to `'admin'`

**Request body shape (flat, to avoid name collisions)**:
```json
{
  "licenseeName": "string",
  "kind": "individual|company",
  "document": "string",
  "licenseeEmail": "string",
  "phone": "string",
  "chatDefault": "string (optional)",
  "chatUrl": "string (optional)",
  "chatIdentifier": "string (optional)",
  "chatKey": "string (optional)",
  "whatsappDefault": "string (optional)",
  "whatsappToken": "string (optional)",
  "whatsappUrl": "string (optional)",
  "userName": "string",
  "userEmail": "string",
  "password": "string"
}
```

The use case maps `licenseeName → name`, `licenseeEmail → email`, `userName → name`, `userEmail → email` internally.

**DI pattern**: constructor-injected repositories. See `src/app/usecases/auth/AuthenticateUser.ts`.

**Rate limiting**: 5 attempts per hour (tighter than login) using `rateLimit` + `RedisStore` from `login-route.ts` lines 12–25.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`; branch `plan/onboarding-wizard/phase-1/task-01-backend-onboarding-endpoint`
- [ ] Verify no `/onboarding` route exists: `grep -r "onboarding" src/app/routes/`
- [ ] Read `src/app/usecases/licensees/CreateLicensee.ts` — note `pickFields` helper (reuse it)
- [ ] Read `src/app/routes/login-route.ts` — note rate limiter setup
- [ ] Read `src/app/usecases/auth/AuthenticateUser.spec.ts` — note spec pattern (factories, memory repos)
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/usecases/onboarding/OnboardAccount.ts` | create | Core use case |
| `src/app/usecases/onboarding/OnboardAccount.spec.ts` | create | Unit tests using memory repos and factories |
| `src/app/controllers/OnboardingController.ts` | create | Thin HTTP adapter |
| `src/app/routes/login-route.ts` | modify | Add rate limiter + `POST /onboarding` |

### Do NOT Modify

- `src/app/routes/resources-routes.ts` — protected routes, no changes needed
- `src/app/usecases/licensees/CreateLicensee.ts` — reference only
- `src/app/usecases/users/CreateUser.ts` — reference only

## Implementation Steps

### Step 1: Create `OnboardAccount` use case

Create `src/app/usecases/onboarding/OnboardAccount.ts`.

```ts
const ONBOARD_LICENSEE_FIELDS = [
  'name', 'email', 'phone', 'document', 'kind',
  'chatDefault', 'chatUrl', 'chatIdentifier', 'chatKey',
  'whatsappDefault', 'whatsappToken', 'whatsappUrl',
]

const ONBOARD_USER_FIELDS = ['name', 'email', 'password']
```

Logic:
1. Map flat request fields to licensee payload: `name ← licenseeName`, `email ← licenseeEmail`, pick remaining from `ONBOARD_LICENSEE_FIELDS`; force `licenseKind: 'demo'`, `active: true`
2. `createdLicensee = await this.licenseeRepository.create(licenseePayload)`
3. If licensee creation throws → re-throw immediately
4. Map flat request fields to user payload: `name ← userName`, `email ← userEmail`, pick `password`; force `role: 'admin'`, `active: true`, set `licensee: createdLicensee._id`
5. Try `createdUser = await this.userRepository.create(userPayload)`
6. If user creation throws → `await this.licenseeRepository.delete(createdLicensee._id)` then re-throw
7. Return `{ licensee: createdLicensee, user: createdUser }`

Constructor: `constructor({ licenseeRepository, userRepository })`

### Step 2: Create `OnboardingController`

Create `src/app/controllers/OnboardingController.ts`.

`validations()` — express-validator checks:
- `licenseeName`: not empty
- `licenseeEmail`: is email
- `phone`: not empty
- `document`: not empty
- `kind`: not empty
- `userName`: not empty
- `userEmail`: is email
- `password`: length ≥ 8

`onboard` handler:
1. Check `validationResult(req)` → 400 on errors
2. Call `this.onboardAccount.execute(req.body)`
3. On success → 201 with `{ licensee, user: { ...omit password from user } }`
4. Catch → 400 with `{ message: error.message }`

### Step 3: Wire into `login-route.ts`

1. Import `OnboardingController`, `LicenseeRepositoryDatabase`, `UserRepositoryDatabase`, `OnboardAccount`
2. Create `onboardingLimiter`: `limit: 5`, `windowMs: 60 * 60 * 1000`, prefix `'rl:onboarding:'`
3. Instantiate use case and controller
4. Add: `router.post('/onboarding', onboardingLimiter, ...onboardingController.validations(), onboardingController.onboard)`

### Step 4: Write unit tests

Create `src/app/usecases/onboarding/OnboardAccount.spec.ts`.

Required test cases:
- Happy path: creates licensee and user, returns `{ licensee, user }`
- Forces `licenseKind: 'demo'` regardless of any field sent
- Forces user `role: 'admin'`; sets `user.licensee` to `createdLicensee._id`
- Maps flat field names correctly (`licenseeName → name`, `licenseeEmail → email`, etc.)
- Includes optional chat/WhatsApp fields in licensee when present in input
- If user creation fails → calls `licenseeRepository.delete` with `createdLicensee._id` and re-throws

**Note**: if `LicenseeRepositoryMemory` or `UserRepositoryMemory` lacks a `delete` method, add it to the memory repository before writing tests — this is a prerequisite for the orphan-cleanup test.

## Testing

- [ ] `OnboardAccount.spec.ts` passes all cases above
- [ ] Manual curl: `curl -X POST http://localhost:5001/login/onboarding -H "Content-Type: application/json" -d '{...}'` returns 201
- [ ] Rate limit: 6th request within 1 hour returns 429
- [ ] `npx jest src/app/usecases/onboarding` passes
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB/doc updates required — pattern mirrors existing use cases

## Completion Criteria

- [ ] `POST /onboarding` route exists and responds correctly with chat/WhatsApp fields forwarded to licensee
- [ ] Use case cleans up orphaned licensee on user creation failure
- [ ] `licenseKind` always `'demo'`; user always `role: 'admin'`
- [ ] All specs pass
- [ ] `pre-commit-check` passes
- [ ] Changes committed to `plan/onboarding-wizard/phase-1/task-01-backend-onboarding-endpoint`
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

No parallel tasks in this phase.
