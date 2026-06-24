# Task: User Model Language Field + Migration Script

**Plan**: App Internationalization (PT/EN)
**Phase**: 1
**Task ID (phase-local)**: task-02
**Task Path**: phase-1/task-02-user-model-backend
**Depends On**: None
**JIRA**: N/A

## Objective

Add a `language` field to the `User` Mongoose model, update `OnboardingController` (and its underlying use case/route validation) to accept and persist `language` in the POST /login/onboarding payload, and provide a MongoDB shell migration script to backfill `language: 'pt'` on all existing users.

## Context

Backend stack: Express 5 / TypeScript, Mongoose. Architecture follows use-case pattern — controllers are thin HTTP adapters that call a use case. The onboarding flow is:

- Route: `POST /login/onboarding` (defined in `src/app/routes/login-route.ts`)
- Controller: `src/app/controllers/OnboardingController.ts`
- Use case: likely `src/app/usecases/` — read the controller to find the use case class it calls

The `User` model lives at `src/app/models/User.ts`. There is no existing `language` field.

The frontend `IUser` type gets the `language` field added by task-01 (phase-1/task-01-i18n-setup). This task is the backend counterpart.

Validation: `OnboardingController` uses `express-validator`. The `language` field should be validated as an optional string `oneOf(['pt', 'en'])`, defaulting to `'pt'` if omitted. This keeps the API backwards-compatible with older clients.

## Before You Start

- [ ] Switch to the task branch: `git switch main && git pull --rebase origin main && git switch -c plan/app-i18n/phase-1/task-02-user-model-backend`
- [ ] Verify task-01 is NOT a dependency (tasks 01 and 02 run in parallel)
- [ ] Check this task's `status.md` — must be `not-started`
- [ ] Read `src/app/controllers/OnboardingController.ts` to find the use case it calls
- [ ] Read that use case file to understand the User creation flow
- [ ] Read `src/app/routes/login-route.ts` to see the existing validation chain
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/models/User.ts` | modify | Add `language` field to schema |
| `src/app/controllers/OnboardingController.ts` | modify | Add `language` to validator + pass to use case |
| `src/app/routes/login-route.ts` | modify | Add `body('language')` validator if not in controller |
| `src/app/usecases/<CreateLicenseeAndUser or equivalent>.ts` | modify | Thread `language` from input to User creation |
| `scripts/migrate-user-language.js` | create | MongoDB shell script |

> Verify the exact use case filename by reading `OnboardingController.ts` — adapt if it differs.

### Do NOT Modify

- `client/src/types/user.ts` — owned by phase-1/task-01-i18n-setup
- `client/src/pages/SignIn/OnboardingModal.tsx` — owned by phase-2/task-04-onboarding-i18n
- Any other backend model or controller

## Implementation Steps

### Step 1: Add `language` to the User Mongoose schema (`src/app/models/User.ts`)

Locate the schema definition and add:
```typescript
language: {
  type: String,
  enum: ['pt', 'en'],
  default: 'pt',
},
```

Place it alongside other user attribute fields (near `role`). Follow the existing field ordering pattern in the file.

### Step 2: Find and update the use case

Read `OnboardingController.ts` to identify the use case class. Open that use case file and:
1. Add `language?: 'pt' | 'en'` to the input type/interface
2. Pass `language: input.language ?? 'pt'` when constructing the User object

### Step 3: Update `OnboardingController.ts` validation

Add language to the validator chain. Follow the existing `body(...)` pattern:
```typescript
body('language')
  .optional()
  .isIn(['pt', 'en'])
  .withMessage('language must be pt or en'),
```

Extract it from `matchedData` and pass to the use case execute call.

### Step 4: Update route validation if applicable

Check `login-route.ts` — if it has its own `check()` array, add the language validator there too.

### Step 5: Create the MongoDB migration script (`scripts/migrate-user-language.js`)

This is a script for the **MongoDB shell** (not Node.js). Add a clear header comment:

```javascript
// MongoDB shell migration: backfill language field on existing users
// Run in MongoDB shell: load('scripts/migrate-user-language.js')
// Or via mongosh: mongosh <connection-string> --file scripts/migrate-user-language.js

const result = db.users.updateMany(
  { language: { $exists: false } },
  { $set: { language: 'pt' } }
)

print('Matched:', result.matchedCount)
print('Modified:', result.modifiedCount)
```

## Testing

- [ ] Run the existing backend test suite: `npx jest --testPathPattern="OnboardingController|User"` — all must pass
- [ ] If a spec exists for the use case (e.g., `CreateLicenseeAndUser.spec.ts`), run it and ensure it passes with the `language` field threaded through
- [ ] Add a test case to the OnboardingController spec:
  - Submitting `language: 'en'` creates a user with `language: 'en'`
  - Omitting `language` creates a user with `language: 'pt'` (default)
  - Submitting `language: 'es'` returns a 422 validation error
- [ ] Run `npx jest` — full backend suite must pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB/doc updates required for this task — the migration script is self-documenting

## Completion Criteria

- [ ] `User.ts` schema has `language: { type: String, enum: ['pt', 'en'], default: 'pt' }`
- [ ] OnboardingController validates and threads `language` to user creation
- [ ] `scripts/migrate-user-language.js` exists with correct `updateMany` and print output
- [ ] All backend tests pass including new language validation test cases
- [ ] Changes committed to `plan/app-i18n/phase-1/task-02-user-model-backend`
- [ ] `status.md` updated to `complete`

## Conflict Avoidance Notes

- Runs in parallel with phase-1/task-01-i18n-setup. That task modifies `client/src/` only; this task modifies `src/` (backend) only. No overlap.
