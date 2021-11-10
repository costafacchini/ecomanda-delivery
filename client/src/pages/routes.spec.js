import { screen } from '@testing-library/react'
import RootRoutes from '../pages/routes'
import mountWithRedux, { createStore } from '../.jest/redux-testing'
import * as auth from '../services/auth'

describe('<RootRoutes>', () => {
  let store

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    window.location.hash = ''
  })

  it('renders the login page if user is not logged in', () => {
    const isAuthenticatedSpy = jest.spyOn(auth, 'isAuthenticated').mockImplementation(() => false)

    store = createStore()
    mountWithRedux(store)(<RootRoutes />)

    const title = screen.getByText(/e-comanda/i)
    const emailField = screen.getByText(/email/i)
    const passwordField = screen.getByText(/senha/i)
    const loginButton = screen.getByText(/entrar/i)

    expect(title).toBeInTheDocument()
    expect(emailField).toBeInTheDocument()
    expect(passwordField).toBeInTheDocument()
    expect(loginButton).toBeInTheDocument()
    expect(isAuthenticatedSpy).toHaveBeenCalled()
  })

  it('renders the dashboard if user is logged in', () => {
    const isAuthenticatedSpy = jest.spyOn(auth, 'isAuthenticated').mockImplementation(() => true)

    store = createStore()
    mountWithRedux(store)(<RootRoutes />)

    const title = screen.getByRole('heading', { name: 'Dashboard' })
    const navbar = screen.getByRole('navigation')

    expect(title).toBeInTheDocument()
    expect(navbar).toBeInTheDocument()
    expect(isAuthenticatedSpy).toHaveBeenCalled()
  })
})
