import { screen } from '@testing-library/react'
import App from './App'
import mountWithRedux, { createStore } from './.jest/redux-testing'
import { AppContextProvider } from './contexts/App'

describe('<App>', () => {
  test('renders the login page', () => {
    const store = createStore()
    mountWithRedux(store)(
      <AppContextProvider>
        <App />
        </AppContextProvider>
    )

    const title = screen.getByText(/e-comanda/i)
    const emailField = screen.getByText(/email/i)
    const passwordField = screen.getByText(/senha/i)
    const loginButton = screen.getByText(/entrar/i)

    expect(title).toBeInTheDocument()
    expect(emailField).toBeInTheDocument()
    expect(passwordField).toBeInTheDocument()
    expect(loginButton).toBeInTheDocument()
  })
})
