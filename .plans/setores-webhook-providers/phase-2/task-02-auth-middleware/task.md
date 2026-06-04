# Task: Auth middleware — resolve sector from query param

**Plan**: Setores — Webhook Providers
**Phase**: 2
**Task ID (phase-local)**: task-02
**Task Path**: phase-2/task-02-auth-middleware
**Depends On**: phase-1/task-01-setor-token
**JIRA**: N/A

## Objective

Extend the `authenticateLicensee` middleware in `api-routes.ts` to read an optional `?setor={setorToken}` query parameter, look up the matching `Setor` document, and attach it to `req.setor`. If `?setor=` is absent or invalid, the request continues without a sector (existing behaviour is preserved).

## Context

`api-routes.ts` defines `buildAuthenticateLicensee`, which currently:
1. Reads `req.query.token`
2. Calls `licenseeRepository.findFirst({ apiToken: req.query.token })`
3. Attaches result to `req.licensee` or returns 401

The sector lookup must happen **after** the licensee is resolved (the Setor is validated against that licensee to prevent cross-licensee token spoofing). The logic is:

```
if req.query.setor present:
  setor = setorRepository.findFirst({ setorToken: req.query.setor, licensee: licensee._id })
  if setor found AND setor.active:
    req.setor = setor
  else:
    return 401  ← invalid/inactive sector token for this licensee
```

Returning 401 on an invalid `?setor=` (rather than silently ignoring it) prevents misconfigured provider webhooks from silently routing to the wrong sector or dropping sector context.

`SetorRepositoryDatabase` and `setorRepository` are wired in `dependencies.ts` by the `setores` plan. Import and instantiate `SetorRepositoryDatabase` directly in `api-routes.ts`, following the same pattern as `LicenseeRepositoryDatabase` on line 6 of the current file.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Create task branch: `git switch -c plan/setores-webhook-providers/phase-2/task-02-auth-middleware`
- [ ] Verify phase-1/task-01-setor-token is complete — confirm `Setor.setorToken` field exists
- [ ] Read `src/app/routes/api-routes.ts` (full file)
- [ ] Read `src/app/repositories/setor.ts` (confirm `findFirst` signature)
- [ ] Check if `src/app/routes/api-routes.spec.ts` exists — if so, read it before editing
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/routes/api-routes.ts` | modify | Add `?setor=` resolution to `authenticateLicensee` |
| `src/app/routes/api-routes.spec.ts` | create or modify | Add sector resolution tests |

### Do NOT Modify

- `src/app/models/Setor.ts` — owned by phase-1/task-01-setor-token (already complete)
- `src/app/controllers/MessengersController.ts` — owned by phase-2/task-03-ingest-pipeline
- `src/app/usecases/webhooks/IngestMessengerMessage.ts` — owned by phase-2/task-03-ingest-pipeline
- `src/app/services/MessengerMessage.ts` — owned by phase-2/task-03-ingest-pipeline

## Implementation Steps

### Step 1: Import `SetorRepositoryDatabase` in `api-routes.ts`

```ts
import { SetorRepositoryDatabase } from '../repositories/setor'
```

Instantiate alongside `licenseeRepository`:
```ts
const setorRepository = new SetorRepositoryDatabase()
```

### Step 2: Update `buildAuthenticateLicensee` signature and logic

```ts
function buildAuthenticateLicensee({ licenseeRepository, setorRepository }: any) {
  return async function authenticateLicensee(req: any, res: any, next: any) {
    if (req.query.token) {
      const licensee = await licenseeRepository.findFirst({ apiToken: req.query.token })
      if (licensee) {
        req.licensee = licensee

        if (req.query.setor) {
          const setor = await setorRepository.findFirst({
            setorToken: req.query.setor,
            licensee: licensee._id,
          })
          if (!setor || !setor.active) {
            return res.status(401).json({ message: 'Token de setor inválido ou inativo.' })
          }
          req.setor = setor
        }

        return next()
      }
    }

    res.status(401).json({ message: 'Token não informado ou inválido.' })
  }
}
```

Pass both repositories when calling `buildAuthenticateLicensee`:
```ts
router.use(buildAuthenticateLicensee({ licenseeRepository, setorRepository }))
```

## Testing

- [ ] Request with valid `?token=` and no `?setor=` — `req.licensee` set, `req.setor` undefined, `next()` called (existing behaviour unchanged)
- [ ] Request with valid `?token=` and valid active `?setor=` matching that licensee — `req.licensee` set, `req.setor` set, `next()` called
- [ ] Request with valid `?token=` and `?setor=` that belongs to a different licensee — 401 returned
- [ ] Request with valid `?token=` and `?setor=` for an inactive sector — 401 returned
- [ ] Request with valid `?token=` and unknown `?setor=` — 401 returned
- [ ] Request with no `?token=` — 401 returned (existing behaviour unchanged)
- [ ] All existing api-routes tests still pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB doc updates required at this task

## Completion Criteria

- [ ] `authenticateLicensee` resolves sector from `?setor=` query param
- [ ] Invalid/inactive/cross-licensee sector tokens return 401
- [ ] Existing no-sector requests are unaffected
- [ ] All tests pass: `npx jest src/app/routes/`
- [ ] `npx eslint src/app/routes/api-routes.ts` passes
- [ ] Changes committed to `plan/setores-webhook-providers/phase-2/task-02-auth-middleware` branch
- [ ] Status updated to `complete` in `status.md`

## Conflict Avoidance Notes

task-03 (ingest-pipeline) owns `MessengersController.ts`, `IngestMessengerMessage.ts`, and `MessengerMessage.ts`. No file overlap with this task. Both can run in parallel once phase-1 is merged.
