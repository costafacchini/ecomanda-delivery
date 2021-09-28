import { HashRouter, Switch, Route, MemoryRouter } from 'react-router-dom'
import { screen } from '@testing-library/react'
import mountWithRedux, { createStore } from '../../.jest/redux-testing'
import PrivateRoute from '../PrivateRoute'
import * as auth from '../../services/auth'

function componentTest() {
  return <h1>Component</h1>
}

describe('<PrivateRoute>', () => {
  let store

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the root route if user is not logged in', () => {
    const isAuthenticatedSpy = jest.spyOn(auth, 'isAuthenticated').mockImplementation(() => false)
    store = createStore()
    mountWithRedux(store)(
      <HashRouter>
        <MemoryRouter initialEntries={['/private']}>
          <PrivateRoute path="/private" component={componentTest} />
          <Route exact path="/">Root route</Route>
        </MemoryRouter>
      </HashRouter>
    )

    const component = screen.queryByText(/Root route/i)
    expect(component).toBeInTheDocument()
    expect(isAuthenticatedSpy).toHaveBeenCalled()
  })

  it('renders the component if user is logged in', () => {
    const isAuthenticatedSpy = jest.spyOn(auth, 'isAuthenticated').mockImplementation(() => true)

    store = createStore()
    mountWithRedux(store)(
      <HashRouter>
        <Switch>
          <PrivateRoute component={componentTest} />
        </Switch>
      </HashRouter>
    )

    const component = screen.getByText(/Component/i)

    expect(component).toBeInTheDocument()
    expect(isAuthenticatedSpy).toHaveBeenCalled()
  })
})
