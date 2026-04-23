function createInitialState() {
  return {
    chatwoot: {
      messages: [],
    },
    ycloud: {
      messages: [],
      uploads: [],
      webhooks: [],
    },
    chatbot: {
      messages: [],
    },
  }
}

const state = createInitialState()

function appendState(section, key, entry) {
  state[section][key].push({
    ...entry,
    capturedAt: new Date().toISOString(),
  })
}

function getState() {
  return JSON.parse(JSON.stringify(state))
}

function resetState() {
  const freshState = createInitialState()

  Object.keys(freshState).forEach((section) => {
    Object.keys(freshState[section]).forEach((key) => {
      state[section][key] = freshState[section][key]
    })
  })

  return getState()
}

export { appendState, getState, resetState }
