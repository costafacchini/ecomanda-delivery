# Task: ChatPanel + ChatbotPanel

**Plan**: Licensee Form Wizard
**Task ID**: task-02
**Task Path**: phase-1/task-02-panel-comms
**Depends On**: phase-1/task-01-panel-general
**JIRA**: N/A

## Before You Start

- [ ] Confirm task-01 branch exists and is complete
- [ ] Branch from task-01: `git switch plan/licensee-form-wizard/phase-1/task-01-panel-general && git switch -c plan/licensee-form-wizard/phase-1/task-02-panel-comms`
- [ ] Read `Form/index.js` (post task-01) to confirm which JSX remains

## Context

Extract **Chat** and **ChatBot** configuration fields into two panel components.

### ChatPanel fields (Form/index.js lines ~316–399)

The **chatDefault combo is the tab trigger** — it moves inside this panel (not in the main tab questions area, as it was before). The question checkbox `useChat` controls tab visibility; `chatDefault` is the provider selector inside the tab.

Fields:
- chatDefault (select: Rocketchat / Crisp / CuboUp / Chatwoot)
- chatUrl (text)
- useSenderName (checkbox — "Usa o remetente no nome do chat?")
- chatIdentifier (text — only when `chatDefault` is `crisp` or `chatwoot`)
- chatKey (text — only when `chatDefault` is `crisp` or `chatwoot`)

Preserve existing conditional: `{['crisp', 'chatwoot'].includes(values.chatDefault) && (...)}`

The outer `<fieldset disabled={chatDefault === ''}>` is replaced by the tab visibility rule (panel not shown when `useChat` is false). Inside the panel, no extra disabled wrapper needed.

### ChatbotPanel fields (Form/index.js lines ~224–314)

Fields:
- chatbotDefault (select: Landbot)
- chatbotUrl (text)
- chatbotAuthorizationToken (text — "Token do chatbot")
- chatbotApiToken (text — "Token de acesso via API do chatbot")
- messageOnResetChatbot (textarea — "Mensagem de encerramento de chatbot abandonado")
- messageOnCloseChat (textarea — "Mensagem de encerramento de chat")

The outer `<fieldset disabled={!useChatbot}>` is replaced by tab visibility. No disabled wrapper inside the panel.

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Licensees/scenes/Form/panels/ChatPanel.js` | create | New panel component |
| `client/src/pages/Licensees/scenes/Form/panels/ChatbotPanel.js` | create | New panel component |
| `client/src/pages/Licensees/scenes/Form/index.js` | modify | Replace extracted JSX with panel imports |

### Do NOT Modify

- `client/src/pages/Licensees/scenes/Form/panels/MainPanel.js` (task-01)
- Any infra panels (task-03)

## Conflict Avoidance Notes

Chain from task-01's branch (see Before You Start above).

## Implementation Steps

### Step 1: Create ChatPanel.js

```js
function ChatPanel({ values, errors, touched, handleChange, handleBlur }) { ... }
```

Include the `crisp`/`chatwoot` conditional for chatIdentifier and chatKey.

### Step 2: Create ChatbotPanel.js

```js
function ChatbotPanel({ values, errors, touched, handleChange, handleBlur }) { ... }
```

### Step 3: Update Form/index.js

Replace the two extracted JSX blocks with `<ChatPanel>` and `<ChatbotPanel>`.
Remove the `useChatbot` `<fieldset disabled>` wrapper — tab visibility handles that.
Remove the `chatDefault === ''` `<fieldset disabled>` wrapper.

## Testing

- [ ] Run `npx jest --testPathPattern=Licensees` — no failures
- [ ] Manual: verify Chat fields still render (chatUrl, useSenderName, chatIdentifier/Key for crisp)
- [ ] Manual: verify ChatBot fields still render
- [ ] No visual change expected — extraction only

## Documentation / KB Updates

No KB/doc updates required.

## Completion Criteria

- [ ] `ChatPanel.js` and `ChatbotPanel.js` created under `panels/`
- [ ] `Form/index.js` imports and renders both panels
- [ ] Conditional logic for chatIdentifier/chatKey preserved
- [ ] `<fieldset disabled>` wrappers removed for these sections
- [ ] All tests pass
- [ ] `npx eslint .` passes
