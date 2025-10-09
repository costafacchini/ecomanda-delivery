import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppContextProvider } from './contexts/App'

// Wrapper customizado que inclui as future flags do React Router
const AllTheProviders = ({ children, initialEntries = ['/'] }) => {
  return (
    <AppContextProvider>
      <MemoryRouter
        initialEntries={initialEntries}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        {children}
      </MemoryRouter>
    </AppContextProvider>
  )
}

// Função de render customizada que usa o wrapper
const customRender = (ui, options = {}) => {
  const { initialEntries, ...renderOptions } = options
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders initialEntries={initialEntries}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  })
}

// Re-exporta tudo
export * from '@testing-library/react'
export { customRender as render }
