# Task: Frontend: super licensee flow + user menu

**Plan**: Local Chat Infrastructure
**Phase**: 2
**Task ID (phase-local)**: task-04
**Task Path**: phase-2/task-04-frontend-super-flow
**Depends On**: phase-1/task-01-user-role-system
**JIRA**: N/A

## Objective

Add `activeLicensee` to AppContext (persisted in localStorage), show a licensee selection modal when super logs in without an active licensee, and replace the "Sair" button in Navbar with a user menu dropdown that includes "Trocar de licenciado" for super users.

## Context

**Current state:**
- `AppContext` holds only `{ currentUser, setCurrentUser }`
- Navbar has a plain `<a>` button "Sair" (line 69 in Navbar)
- Super users select a licensee per-page via `SelectLicenseesWithFilter`
- `isAdmin` and `isSuper` booleans control nav item visibility

**After this task:**
- `AppContext` gains `activeLicensee` + `setActiveLicensee`
- `activeLicensee` is persisted in `localStorage` key `@ecomanda-delivery-active-licensee` (as `{ _id, name }`)
- After login, if `currentUser.role === 'super'` and no `activeLicensee` in localStorage, show `SelectLicenseeModal` before allowing access to any page
- `BaseLayout` guards the render: if super and no `activeLicensee`, render only the modal
- Navbar "Sair" becomes a Bootstrap dropdown with: user avatar (default icon), user name, "Sair", and "Trocar de licenciado" (super only)
- Role checks in Navbar change from `isAdmin`/`isSuper` booleans to `currentUser.role` comparisons

**`activeLicensee` usage:**
- Pages that currently auto-set `filters.licensee = currentUser.licensee` for non-super should also use `activeLicensee` when the user is super and has a selection
- This removes the per-page `SelectLicenseesWithFilter` for super users (they select once globally)

**Default avatar:** A simple Bootstrap icon or a generic SVG — no upload, no external service. Use Bootstrap Icons `person-circle` or equivalent.

Read `client/src/contexts/App/index.tsx`, `client/src/pages/Navbar/index.tsx`, `client/src/pages/BaseLayout/index.tsx`, and `client/src/services/auth.ts` before implementing.

## Before You Start

- [ ] Switch to main and pull: `git switch main && git pull --rebase origin main`
- [ ] Create task branch: `git switch -c plan/local-chat-infra/phase-2/task-04-frontend-super-flow`
- [ ] Verify `phase-1/task-01-user-role-system/status.md` shows `complete`
- [ ] Verify this task's `status.md` shows `not-started`
- [ ] Read `client/src/contexts/App/index.tsx` (full file)
- [ ] Read `client/src/pages/Navbar/index.tsx` (full file)
- [ ] Read `client/src/pages/BaseLayout/index.tsx` (full file)
- [ ] Read `client/src/services/auth.ts` (full file)
- [ ] Read `client/src/pages/SignIn/index.tsx` (full file)
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/contexts/App/index.tsx` | modify | Add `activeLicensee` + `setActiveLicensee` |
| `client/src/services/auth.ts` | modify | Add `activeLicensee` localStorage helpers |
| `client/src/components/SelectLicenseeModal/index.tsx` | create | Licensee picker modal |
| `client/src/pages/BaseLayout/index.tsx` | modify | Guard render for super without activeLicensee |
| `client/src/pages/Navbar/index.tsx` | modify | User menu dropdown; role-based nav item visibility |
| `client/src/pages/SignIn/index.tsx` | modify | Load `activeLicensee` from localStorage on login |

### Do NOT Modify

- `src/app/` — backend is owned by other tasks
- `client/src/pages/Messages/` — owned by phase-3/task-05-route-authorization

## Implementation Steps

### Step 1: Update `client/src/services/auth.ts`

Add localStorage helpers for `activeLicensee`:

```js
const ACTIVE_LICENSEE_KEY = '@ecomanda-delivery-active-licensee'

export const saveActiveLicensee = (licensee) =>
  localStorage.setItem(ACTIVE_LICENSEE_KEY, JSON.stringify(licensee))

export const loadActiveLicensee = () => {
  try {
    return JSON.parse(localStorage.getItem(ACTIVE_LICENSEE_KEY))
  } catch { return null }
}

export const clearActiveLicensee = () =>
  localStorage.removeItem(ACTIVE_LICENSEE_KEY)
```

Update `logout()` to also call `clearActiveLicensee()`.

### Step 2: Update `client/src/contexts/App/index.tsx`

```js
const [currentUser, setCurrentUser] = useState()
const [activeLicensee, setActiveLicensee] = useState(loadActiveLicensee)

const updateActiveLicensee = (licensee) => {
  saveActiveLicensee(licensee)
  setActiveLicensee(licensee)
}

// Expose: currentUser, setCurrentUser, activeLicensee, updateActiveLicensee
```

### Step 3: Create `client/src/components/SelectLicenseeModal/index.tsx`

A Bootstrap modal that wraps the existing `SelectLicenseesWithFilter` component. On confirm, calls `updateActiveLicensee(selected)` and closes. Cannot be dismissed without a selection (no X button, no backdrop click close).

Edge case: if no licensees exist, show a message "Nenhum licenciado disponível" and a "Sair" link.

### Step 4: Update `client/src/pages/BaseLayout/index.tsx`

After loading `currentUser`, check:
```js
if (currentUser?.role === 'super' && !activeLicensee) {
  return <SelectLicenseeModal onSelect={updateActiveLicensee} />
}
```

This blocks all navigation until super selects a licensee.

### Step 5: Update `client/src/pages/SignIn/index.tsx`

After `setCurrentUser(user)`, if `user.role === 'super'`:
- Try to load `activeLicensee` from localStorage
- If none found, do nothing — `BaseLayout` will show the modal

If `user.role !== 'super'`, `activeLicensee` is irrelevant (their licensee comes from `currentUser.licensee`).

### Step 6: Replace "Sair" with user menu in `client/src/pages/Navbar/index.tsx`

Replace:
```jsx
<a className='btn btn-primary' href='/' onClick={logout}>Sair</a>
```

With a Bootstrap dropdown:
```jsx
<div className='dropdown'>
  <button className='btn dropdown-toggle' data-bs-toggle='dropdown'>
    <i className='bi bi-person-circle'></i> {currentUser?.name}
  </button>
  <ul className='dropdown-menu dropdown-menu-end'>
    {currentUser?.role === 'super' && (
      <li>
        <button className='dropdown-item' onClick={openLicenseeModal}>
          Trocar de licenciado
        </button>
      </li>
    )}
    <li>
      <a className='dropdown-item' href='/' onClick={logout}>Sair</a>
    </li>
  </ul>
</div>
```

"Trocar de licenciado" sets `updateActiveLicensee(null)` which triggers the `BaseLayout` guard and shows the modal again.

Update nav item visibility from `isAdmin`/`isSuper` to `role`:
```js
// Before:
currentUser?.isAdmin

// After:
['admin', 'super'].includes(currentUser?.role)
```

## Testing

- [ ] After login as super with no `activeLicensee` in localStorage → modal is shown
- [ ] After selecting a licensee in modal → `activeLicensee` is persisted and app renders normally
- [ ] "Trocar de licenciado" clears `activeLicensee` and shows modal again
- [ ] Logout clears `activeLicensee` from localStorage
- [ ] Non-super user: no modal shown, no "Trocar de licenciado" in menu
- [ ] Navbar admin menu visible for `role: 'admin'` and `role: 'super'`
- [ ] Navbar admin menu hidden for `role: 'agent'` and `role: 'supervisor'`
- [ ] `pre-commit-check` passes

## Documentation / KB Updates

- [ ] No KB doc updates required at this task

## Completion Criteria

- [ ] `activeLicensee` in AppContext with localStorage persistence
- [ ] Super user blocked until licensee selected
- [ ] User menu dropdown with "Sair" and "Trocar de licenciado"
- [ ] Navbar role checks use `currentUser.role`
- [ ] Changes committed to `plan/local-chat-infra/phase-2/task-04-frontend-super-flow` branch
- [ ] Status updated to `complete` in `status.md`

## Conflict Avoidance Notes

- task-03 modifies only backend files. No overlap with this task.
