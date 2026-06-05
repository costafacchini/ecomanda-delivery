# Task: Sign-in Page Integration

**Plan**: Onboarding Wizard
**Phase**: 3
**Task ID (phase-local)**: task-03
**Task Path**: phase-3/task-03-signin-integration
**Depends On**: phase-2/task-02-onboarding-modal
**JIRA**: N/A

## Objective

Update `client/src/pages/SignIn/index.tsx` to add a "Criar conta" link below the login button, manage `isOpen` state for `OnboardingModal`, display a success banner after successful onboarding, and redirect the user to the login form so they can sign in immediately.

## Context

`SignIn/index.tsx` is a functional React component (98 lines) with local `useState` hooks for `email`, `password`, and `error`. The background is an inline gradient `linear-gradient(135deg, #2c3e50, #3498db)`.

The `OnboardingModal` (created in task-02) accepts `isOpen`, `onClose`, and `onSuccess` props. `onSuccess` should:
1. Set `isOpen` to `false`
2. Set a `successMessage` state (e.g., "Conta criada com sucesso! Faça login para continuar.")
3. Clear `successMessage` after 8 seconds or leave it persistent — keep it persistent (user needs to read it and then log in)

The "Criar conta" link sits below the login button and is styled as a subtle text link (`btn btn-link` or plain `<a>` tag) matching the page's light-text-on-dark aesthetic.

**Important**: `OnboardingModal` renders itself over the sign-in page background — it must be mounted inside the `SignIn` component's JSX (not in a portal) so the gradient background shows through the modal overlay.

## Before You Start

- [ ] `git switch main && git pull --rebase origin main`
- [ ] Verify task-02 status.md shows `complete`
- [ ] Read `client/src/pages/SignIn/index.tsx` in full — know the existing state hooks and JSX structure before touching it
- [ ] Confirm `OnboardingModal.tsx` exists at `client/src/pages/SignIn/OnboardingModal.tsx`
- [ ] Mark this task `in-progress` in `status.md` before proceeding

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/SignIn/index.tsx` | modify | Add modal state, success banner, "Criar conta" link, and modal mount |

### Do NOT Modify

- `client/src/pages/SignIn/OnboardingModal.tsx` — owned by phase-2/task-02-onboarding-modal
- `client/src/services/onboarding.ts` — owned by phase-2/task-02-onboarding-modal

## Implementation Steps

### Step 1: Add state and handlers

Add to the `SignIn` component:
```tsx
const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
const [successMessage, setSuccessMessage] = useState('')
```

Add handlers:
```tsx
function handleOnboardingSuccess() {
  setIsOnboardingOpen(false)
  setSuccessMessage('Conta criada com sucesso! Faça login para continuar.')
}
```

### Step 2: Add success banner in JSX

Below the `error` display and above the login button, add:
```tsx
{successMessage && (
  <div className="alert alert-success mt-3">{successMessage}</div>
)}
```

### Step 3: Add "Criar conta" link

Below the existing login `<button>` (line 82–86 of current file), add:
```tsx
<div className="text-center mt-3">
  <button
    type="button"
    className="btn btn-link text-white p-0"
    onClick={() => setIsOnboardingOpen(true)}
  >
    Criar conta
  </button>
</div>
```

### Step 4: Mount the modal

At the bottom of the returned JSX (still inside the outer `<>` fragment), add:
```tsx
<OnboardingModal
  isOpen={isOnboardingOpen}
  onClose={() => setIsOnboardingOpen(false)}
  onSuccess={handleOnboardingSuccess}
/>
```

Import `OnboardingModal` at the top of the file:
```tsx
import OnboardingModal from './OnboardingModal'
```

### Step 5: Verify rendering

Run `yarn run dev` (backend on port 5001, frontend on Vite default). Navigate to `/signin`, confirm:
- "Criar conta" link appears
- Clicking it opens the modal over the gradient background
- Completing the wizard closes the modal and shows the success alert
- The success alert is visible and the login form is ready to use

## Testing

- [ ] Manual walkthrough: full happy path — fill both steps, submit, see success banner, log in with created credentials
- [ ] Manual: close button (X) in modal header dismisses modal without submitting
- [ ] Manual: step-1 validation — try to advance with empty fields; form should not advance
- [ ] Manual: duplicate email — server returns error; modal displays it inline
- [ ] No existing tests in `client/src/pages/SignIn/` to preserve or update
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB/doc updates required — change is a simple component composition
- [ ] If onboarding pattern is later extended, run `document-solution` at that point

## Completion Criteria

- [ ] "Criar conta" link visible on the sign-in page
- [ ] Clicking link opens `OnboardingModal` over the gradient background
- [ ] On successful onboarding, modal closes and success banner appears
- [ ] Login form remains functional (no regressions)
- [ ] `pre-commit-check` passes
- [ ] Changes committed to `plan/onboarding-wizard/phase-3/task-03-signin-integration`
- [ ] Status updated in `status.md`

## Conflict Avoidance Notes

No parallel tasks in this phase.
