# Task: System Model Interfaces

**Plan**: Backend Type Narrowing
**Phase**: 1
**Task ID (phase-local)**: task-03
**Task Path**: phase-1/task-03-system-model-interfaces
**Depends On**: None
**JIRA**: N/A

## Objective

Define TypeScript interfaces for the infrastructure/system models — User, Template, Backgroundjob, Integrationlog, Trafficlight, and WhatsappSession — and add them to `src/types/index.ts`.

## Context

These models support the application infrastructure rather than the business domain. WhatsappSession is used by the Baileys plugin for QR code authentication persistence. Backgroundjob tracks async job state. Integrationlog records third-party API call history. Trafficlight manages chatbot flow control. Template stores WhatsApp message templates.

Reference models:
- `src/app/models/User.ts`
- `src/app/models/Template.ts`
- `src/app/models/Backgroundjob.ts`
- `src/app/models/Integrationlog.ts`
- `src/app/models/Trafficlight.ts`
- `src/app/models/WhatsappSession.ts`

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Read `docs/kb/architecture/typescript-conventions.md`
- [ ] Verify task-01 status — if complete, import `ILicensee` as needed; if not, stub with `any`
- [ ] Check this task's `status.md` — if already `in-progress` or `complete`, stop and investigate
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/types/user.ts` | create | `IUser` interface |
| `src/types/template.ts` | create | `ITemplate` interface |
| `src/types/backgroundjob.ts` | create | `IBackgroundjob` interface |
| `src/types/integrationlog.ts` | create | `IIntegrationlog` interface |
| `src/types/trafficlight.ts` | create | `ITrafficlight` interface |
| `src/types/whatsappsession.ts` | create | `IWhatsappSession` interface |
| `src/types/index.ts` | modify | Add exports for new interfaces |
| `src/app/models/User.ts` | modify | Apply `IUser` |
| `src/app/models/Template.ts` | modify | Apply `ITemplate` |
| `src/app/models/Backgroundjob.ts` | modify | Apply `IBackgroundjob` |
| `src/app/models/Integrationlog.ts` | modify | Apply `IIntegrationlog` |
| `src/app/models/Trafficlight.ts` | modify | Apply `ITrafficlight` |
| `src/app/models/WhatsappSession.ts` | modify | Apply `IWhatsappSession` |

### Do NOT Modify

- `src/types/licensee.ts`, `src/types/contact.ts`, `src/types/message.ts`, `src/types/body.ts` — owned by phase-1/task-01
- `src/types/cart.ts`, `src/types/order.ts`, `src/types/product.ts`, `src/types/room.ts`, `src/types/trigger.ts` — owned by phase-1/task-02
- `src/app/models/Licensee.ts`, `src/app/models/Contact.ts`, `src/app/models/Message.ts`, `src/app/models/Body.ts` — owned by phase-1/task-01

## Implementation Steps

### Step 1: Define interfaces

For each model in scope, read the schema definition and produce a matching interface. Pay special attention to:
- `IUser` — has `validPassword(password: string): Promise<boolean>` instance method; include it in the interface
- `IWhatsappSession` — used by Baileys plugin; read `docs/kb/features/baileys-whatsapp-guide.md` for context on fields
- `ITemplate` — has `namespace`, `name`, `licensee` fields and template components

### Step 2: Apply to Mongoose schemas

Update each model file to pass the interface as the generic parameter.

### Step 3: Export from barrel

Add each new interface to `src/types/index.ts`.

### Step 4: Typecheck

Run `npx tsc --noEmit` and fix errors only within owned files.

## Testing

- [ ] `npx tsc --noEmit` passes with no new errors
- [ ] `NODE_ENV=test npx jest --testPathPattern="models/(User|Template|Backgroundjob|Integrationlog)" --no-coverage` — all pass
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB/doc updates required (pattern established by task-01)

## Completion Criteria

- [ ] All 6 system model interfaces defined and exported from `src/types/`
- [ ] Mongoose models typed with their interfaces
- [ ] `npx tsc --noEmit` clean
- [ ] All relevant model tests pass
- [ ] Status updated in `status.md`
- [ ] Changes committed to `plan/type-backend/phase-1/task-03-system-model-interfaces`

## Conflict Avoidance Notes

- Only append to `src/types/index.ts` — do not modify exports added by task-01 or task-02.
