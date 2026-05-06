# Task: AwsPanel + CartPanel + FinancialPanel + OthersPanel

**Plan**: Licensee Form Wizard
**Task ID**: task-03
**Task Path**: phase-1/task-03-panel-infra
**Depends On**: phase-1/task-02-panel-comms
**JIRA**: N/A

## Before You Start

- [ ] Read `client/src/pages/Licensees/scenes/Form/index.js` (after task-01 + task-02 changes) to identify remaining field groups
- [ ] List all props needed by each panel

## Context

Extract the remaining field groups: AWS S3 configuration, cart/store settings, financial/payment settings, and miscellaneous (Pedidos10, webhooks, etc.).

**AwsPanel** fields: awsDefaultRegion, awsBucketNameFiles, awsBucketNameAudios, awsAccessKeyId, awsSecretAccessKey

**CartPanel** fields: productFractional, productRandomSorting, cartDefault, and any cart-related fields

**FinancialPanel** fields: pagarmeApiKey, billingType, and any payment-related fields

**OthersPanel** fields: pedidos10Token, webhookUrl, sendInactiveMessage, inactiveMessage, and any remaining fields not covered by other panels

> Note: exact field grouping should be confirmed by reading the current Form/index.js. Adjust panel names/groupings as makes sense for the actual fields present.

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Licensees/scenes/Form/panels/AwsPanel.js` | create | New panel component |
| `client/src/pages/Licensees/scenes/Form/panels/CartPanel.js` | create | New panel component (if cart fields exist) |
| `client/src/pages/Licensees/scenes/Form/panels/FinancialPanel.js` | create | New panel component (if financial fields exist) |
| `client/src/pages/Licensees/scenes/Form/panels/OthersPanel.js` | create | Remaining fields not in other panels |
| `client/src/pages/Licensees/scenes/Form/index.js` | modify | Replace remaining inlined JSX with panel components |

### Do NOT Modify

- `client/src/pages/Licensees/scenes/Form/panels/GeneralPanel.js` (task-01)
- `client/src/pages/Licensees/scenes/Form/panels/ChatbotPanel.js` (task-01)
- `client/src/pages/Licensees/scenes/Form/panels/ChatPanel.js` (task-02)
- `client/src/pages/Licensees/scenes/Form/panels/WhatsAppPanel.js` (task-02)

## Conflict Avoidance Notes

Branch from task-02's branch (chained): `git switch plan/licensee-form-wizard/phase-1/task-02-panel-comms && git switch -c plan/licensee-form-wizard/phase-1/task-03-panel-infra`

## Implementation Steps

### Step 1: Identify remaining fields
Read Form/index.js after task-01 and task-02 changes. List all JSX sections not yet extracted.

### Step 2: Create panel components
Create one file per logical group. Each component is purely presentational.
Props: `{ values, errors, touched, handleChange, handleBlur, setFieldValue }` (pass only what's needed).

### Step 3: Update Form/index.js
Replace remaining inlined JSX with the new panel imports. After this task, Form/index.js should render only panel components (no inlined field JSX).

## Testing

- [ ] Run `npx jest --testPathPattern=Licensees` — all tests pass
- [ ] Manual: verify all form fields are still visible and editable
- [ ] Manual: verify save/update still works

## Documentation / KB Updates

No KB/doc updates required.

## Completion Criteria

- [ ] All remaining field groups extracted into panel components
- [ ] `Form/index.js` contains no inlined field JSX — only panel imports and layout
- [ ] All tests pass
- [ ] `npx eslint .` passes
