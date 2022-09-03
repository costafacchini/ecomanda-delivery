import { screen, render } from '@testing-library/react'
import App from './App'
import { AppContextProvider } from './contexts/App'

describe('<App>', () => {
  test('renders the login page', () => {
    render(
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
