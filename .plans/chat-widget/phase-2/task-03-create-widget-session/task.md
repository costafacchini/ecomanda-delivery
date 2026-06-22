# Task: Use Case — CreateWidgetSession

**Plan**: Chat Widget
**Phase**: 2
**Task ID (phase-local)**: task-03
**Task Path**: phase-2/task-03-create-widget-session
**Depends On**: phase-1/task-01-contact-web-type
**JIRA**: N/A

## Objective

Implement `CreateWidgetSession` — the use case that finds or creates a `web` Contact for a widget visitor (identified by name + email) and returns a `widgetSessionToken` for subsequent API calls.

## Context

This is the first call a widget makes after the visitor submits the session form. The use case:

1. Looks up the Licensee by `apiToken`
2. Finds or creates a Contact with `{ number: phone || '00000000000', type: 'web', email, name, licensee }`
3. If the Contact lacks a `widgetSessionToken`, generates one (UUID v4) and persists it
4. Returns `{ widgetSessionToken, contactId, licenseeId }`

The `widgetSessionToken` is stored in the visitor's `localStorage` and sent with every subsequent widget API request.

Contact lookup uses `{ email, type: 'web', licensee }` — email is the stable deduplication key. Phone is stored on the contact but not used for lookup (it may be `'00000000000'` if the visitor skipped it).

Existing pattern to follow: `src/app/usecases/onboarding/OnboardAccount.ts` — see how it composes repositories in the constructor and exposes a single `execute(input)` method.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify `phase-1/task-01-contact-web-type` status is `complete` (widgetSessionToken field exists)
- [ ] Read `src/app/usecases/onboarding/OnboardAccount.ts` — constructor + execute pattern
- [ ] Read `src/app/repositories/contact.ts` — `findFirst` and `create` signatures
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `src/app/usecases/widget/CreateWidgetSession.ts` | create | Use case implementation |
| `src/app/usecases/widget/CreateWidgetSession.spec.ts` | create | Unit tests with memory repos |

### Do NOT Modify

- `src/app/usecases/widget/SendWidgetMessage.ts` — owned by task-04
- `src/app/usecases/widget/GetWidgetMessages.ts` — owned by task-05
- `src/app/repositories/contact.ts` — owned by Phase 1

## Implementation Steps

### Step 1: Create the use case

`src/app/usecases/widget/CreateWidgetSession.ts`:

```ts
import { v4 as uuidv4 } from 'uuid'

class CreateWidgetSession {
  licenseeRepository: any
  contactRepository: any

  constructor({ licenseeRepository, contactRepository }: Record<string, any> = {}) {
    this.licenseeRepository = licenseeRepository
    this.contactRepository = contactRepository
  }

  async execute({ apiToken, name, email, phone }: { apiToken: string; name: string; email: string; phone?: string }) {
    const licensee = await this.licenseeRepository.findFirst({ apiToken })
    if (!licensee) throw new Error(`Licensee not found for token: ${apiToken}`)

    let contact = await this.contactRepository.findFirst({
      email,
      type: 'web',
      licensee: licensee._id,
    })

    if (!contact) {
      contact = await this.contactRepository.create({
        number: phone || '00000000000',
        type: 'web',
        name,
        email,
        talkingWithChatBot: false,
        licensee: licensee._id,
        widgetSessionToken: uuidv4(),
      })
    } else if (!contact.widgetSessionToken) {
      contact.widgetSessionToken = uuidv4()
      await this.contactRepository.save(contact)
    }

    return {
      widgetSessionToken: contact.widgetSessionToken,
      contactId: contact._id.toString(),
      licenseeId: licensee._id.toString(),
    }
  }
}

export { CreateWidgetSession }
```

### Step 2: Write specs

`src/app/usecases/widget/CreateWidgetSession.spec.ts`:

- When licensee not found → throws with helpful message
- When no existing contact → creates web contact with `number: phone || '00000000000'`, email in email field, returns token
- When phone provided → stored as `number`; when omitted → `'00000000000'` stored as placeholder
- When contact exists but has no widgetSessionToken → generates one and returns it
- When contact exists with widgetSessionToken → returns existing token (idempotent)
- Uses `LicenseeRepositoryDatabase` + `ContactRepositoryDatabase` with `installMemoryRepositories()`

## Testing

- [ ] 4 spec cases pass
- [ ] `yarn test src/app/usecases/widget/CreateWidgetSession.spec.ts` green
- [ ] `yarn typecheck` passes

## Documentation / KB Updates

No KB/doc updates required for this task alone. After Phase 3 ships (when the full widget API is wired), run `document-solution` to capture the widget session pattern.

## Completion Criteria

- [ ] Use case created and all specs pass
- [ ] Idempotent: calling twice with same email returns same token
- [ ] Status updated to `complete` in `status.md`

## Conflict Avoidance Notes

- task-04 and task-05 run in parallel — they create sibling files in `src/app/usecases/widget/`. No shared files.
