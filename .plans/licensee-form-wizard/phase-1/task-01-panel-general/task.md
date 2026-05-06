# Task: GeneralPanel + ChatbotPanel

**Plan**: Licensee Form Wizard
**Task ID**: task-01
**Task Path**: phase-1/task-01-panel-general
**Depends On**: None
**JIRA**: N/A

## Before You Start

- [ ] Read `client/src/pages/Licensees/scenes/Form/index.js` in full to identify the exact field groups
- [ ] Note all Formik props and helpers used by the general/chatbot sections
- [ ] Confirm `client/src/pages/Licensees/scenes/Form/panels/` does not yet exist

## Context

`Form/index.js` is ~960 lines with all fields inlined. This task extracts the **general licensee fields** and **chatbot configuration fields** into two presentational components. No behavior change — pure extraction.

**GeneralPanel** fields (from top of form):
- name, phone, email, active, licenseKind, contractStartedAt, contractEndedAt, whatsappDefault

**ChatbotPanel** fields:
- chatbotDefault, chatbotApiToken, chatbotUrl, messageOnInactive, messageOnInactiveAlt, noteOnInactive

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Licensees/scenes/Form/panels/GeneralPanel.js` | create | New panel component |
| `client/src/pages/Licensees/scenes/Form/panels/ChatbotPanel.js` | create | New panel component |
| `client/src/pages/Licensees/scenes/Form/index.js` | modify | Replace inlined JSX with `<GeneralPanel>` and `<ChatbotPanel>` |

### Do NOT Modify

- `client/src/pages/Licensees/scenes/Form/panels/ChatPanel.js` (task-02)
- `client/src/pages/Licensees/scenes/Form/panels/WhatsAppPanel.js` (task-02)
- `client/src/pages/Licensees/scenes/Form/panels/AwsPanel.js` (task-03)
- Any other panel files (task-03)

## Conflict Avoidance Notes

task-01, task-02, task-03 all modify `Form/index.js`. Run them sequentially (01 → 02 → 03) on chained branches, or coordinate file sections carefully if truly parallel.

**Recommended approach**: chain branches — task-02 branches from task-01, task-03 branches from task-02.

## Implementation Steps

### Step 1: Create panels directory
```bash
mkdir -p client/src/pages/Licensees/scenes/Form/panels
```

### Step 2: Create GeneralPanel.js
Extract fields: name, phone, email, active, licenseKind, contractStartedAt, contractEndedAt, whatsappDefault.

Props: `{ values, errors, touched, handleChange, handleBlur, setFieldValue }`

### Step 3: Create ChatbotPanel.js
Extract fields: chatbotDefault, chatbotApiToken, chatbotUrl, messageOnInactive, messageOnInactiveAlt, noteOnInactive.

Visibility logic: show chatbotApiToken and chatbotUrl only when `values.chatbotDefault !== 'none'` (carry forward existing conditional).

Props: `{ values, errors, touched, handleChange, handleBlur }`

### Step 4: Replace inlined JSX in Form/index.js
Import and render `<GeneralPanel>` and `<ChatbotPanel>` in place of the extracted JSX. Pass all required props explicitly.

## Testing

- [ ] Run `npx jest --testPathPattern=Licensees` and confirm no test failures
- [ ] Manual: open the Create Licensee form and verify general and chatbot fields are visible and functional
- [ ] No visual change expected — this is a pure extraction

## Documentation / KB Updates

No KB/doc updates required — this is a presentational refactor with no behavior change.

## Completion Criteria

- [ ] `GeneralPanel.js` and `ChatbotPanel.js` created under `panels/`
- [ ] `Form/index.js` imports and renders both panels
- [ ] No field is lost or duplicated
- [ ] All tests pass
- [ ] `npx eslint .` passes
