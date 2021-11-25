import { configureStore } from '@reduxjs/toolkit'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import React from 'react'
import reducer from './reducers'

export const createStore = (preloadedState) => {
  let dispatchedActions = []

  const logDispatchesButThunksMiddleware = () => (next) => (action) => {
    const isThunkDispatches = typeof action === 'function'
    if (!isThunkDispatches) {
      dispatchedActions.push(action)
    }

    return next(action)
  }

  function getActions() {
    return dispatchedActions
  }

  function clearActions() {
    dispatchedActions = []
  }

  const store = configureStore({
    reducer,
    preloadedState,
    devTools: false,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(logDispatchesButThunksMiddleware),
  })

  return {
    ...store,
    getActions,
    clearActions,
  }
}

export default function mountWithRedux(store = createStore(), optionsForMounter) {
  const mountWithProvider = (component, store) => render(<Provider store={store}>{component}</Provider>, optionsForMounter)

  return (component) => mountWithProvider(component, store)
}