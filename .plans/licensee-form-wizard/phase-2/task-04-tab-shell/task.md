# Task: Tab Shell in Form/index.js

**Plan**: Licensee Form Wizard
**Task ID**: task-04
**Task Path**: phase-2/task-04-tab-shell
**Depends On**: phase-1/task-01-panel-general, phase-1/task-02-panel-comms, phase-1/task-03-panel-infra
**JIRA**: N/A

## Before You Start

- [ ] Confirm all Phase 1 tasks are `complete` or `adapted`
- [ ] Read `Form/index.js` to see the current panel composition
- [ ] Verify Bootstrap 5 is available (`client/package.json` should have bootstrap 5.x)
- [ ] Review existing tab logic patterns in the codebase (if any)

## Context

Add Bootstrap 5 Nav Tabs to `Form/index.js`. Each tab corresponds to a logical panel group. Tabs are shown/hidden via CSS based on `whatsappDefault` and `chatbotDefault` values — panels are **always mounted** so Formik captures all field values on submit.

### Tab layout

| Tab Label | Panels | Always Visible? | Condition |
|-----------|--------|-----------------|-----------|
| Geral | GeneralPanel | Yes | Always |
| Chatbot | ChatbotPanel | No | `chatbotDefault !== 'none'` |
| Chat | ChatPanel | Yes | Always |
| WhatsApp | WhatsAppPanel | No | `whatsappDefault !== ''` (i.e. any messenger selected) |
| Infraestrutura | AwsPanel | Yes | Always |
| Outros | CartPanel + FinancialPanel + OthersPanel | Yes | Always |

> Adjust tab visibility rules as appropriate after reading the actual form logic.

### Key constraint: always-mounted panes

Use Bootstrap's tab CSS classes (`tab-pane`, `show`, `active`) controlled by `activeTab` state. Do NOT use `&&` to conditionally render panels — all panels must remain in the DOM.

```jsx
// Correct — always mounted, CSS-driven visibility:
<div className={`tab-pane fade ${activeTab === 'geral' ? 'show active' : ''}`}>
  <GeneralPanel ... />
</div>

// Wrong — unmounts on tab switch, Formik loses state:
{activeTab === 'geral' && <GeneralPanel ... />}
```

### Tab nav buttons

Use `type="button"` on all nav buttons to prevent form submission on click:
```jsx
<button type="button" className="nav-link" onClick={() => setActiveTab('geral')}>
  Geral
</button>
```

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Licensees/scenes/Form/index.js` | modify | Add `activeTab` useState, Bootstrap Nav Tabs nav + panes |

### Do NOT Modify

- Panel component files (owned by Phase 1 tasks — do not refactor panels during this task)

## Conflict Avoidance Notes

This is the only task in Phase 2 — no parallel conflicts.

## Implementation Steps

### Step 1: Add activeTab state
```jsx
const [activeTab, setActiveTab] = useState('geral')
```

### Step 2: Add Bootstrap Nav Tabs nav
Inside the form, before the field content, add:
```jsx
<ul className="nav nav-tabs mb-3">
  <li className="nav-item">
    <button type="button" className={`nav-link ${activeTab === 'geral' ? 'active' : ''}`} onClick={() => setActiveTab('geral')}>
      Geral
    </button>
  </li>
  {/* ... other tabs, conditionally rendered based on form values */}
</ul>
```

Tab nav items for conditional tabs (`chatbot`, `whatsapp`) should only render the **button** when the condition is met, but the **pane** should always be in the DOM.

### Step 3: Wrap panels in tab panes
```jsx
<div className="tab-content">
  <div className={`tab-pane fade ${activeTab === 'geral' ? 'show active' : ''}`}>
    <GeneralPanel ... />
  </div>
  {/* ... */}
</div>
```

### Step 4: Auto-switch on value change
When `whatsappDefault` changes to a value that hides the WhatsApp tab, auto-switch to 'geral' if the user is on the now-hidden tab. Use a `useEffect` watching `values.whatsappDefault` and `values.chatbotDefault`.

## Testing

- [ ] Manual: switch between all tabs — verify correct panels shown
- [ ] Manual: fill a field on tab A, switch to tab B, submit — verify field A value is saved
- [ ] Manual: select `baileys` for whatsappDefault — verify WhatsApp tab appears and QR generation works
- [ ] Manual: set `chatbotDefault` to 'none' — verify Chatbot tab disappears (or hides)
- [ ] Run `npx jest --testPathPattern=Licensees` — all tests pass

## Documentation / KB Updates

If the tab/wizard pattern is non-obvious for future contributors, run `document-solution` after completion to capture the always-mounted panel constraint.

## Completion Criteria

- [ ] Bootstrap Nav Tabs rendered in Form/index.js
- [ ] Active tab controlled by `activeTab` useState
- [ ] Tab visibility driven by form values
- [ ] All panels always mounted (no `&&` conditional rendering of panels)
- [ ] Tab nav buttons have `type="button"`
- [ ] QR code generation still works on WhatsApp tab
- [ ] All tests pass
- [ ] `npx eslint .` passes
