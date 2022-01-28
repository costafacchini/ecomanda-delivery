import { HashRouter, Routes, Route } from 'react-router-dom'
import { screen } from '@testing-library/react'
import mountWithRedux, { createStore } from '../../.jest/redux-testing'
import PrivateRoute from '../PrivateRoute'
import * as auth from '../../services/auth'
describe('<PrivateRoute>', () => {
  let store

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the component if user is logged in', () => {
    const isAuthenticatedSpy = jest.spyOn(auth, 'isAuthenticated').mockImplementation(() => true)

    store = createStore()
    mountWithRedux(store)(
      <HashRouter>
          <Routes>
            <Route
              path='/'
              element={
                <PrivateRoute redirectTo='/another'>
                  <p>Component</p>
                </PrivateRoute>
              }
            />
            <Route exact path='/another' element={<p>Root route</p>} />
          </Routes>
      </HashRouter>
    )

    const component = screen.getByText(/Component/i)

    expect(component).toBeInTheDocument()
    expect(isAuthenticatedSpy).toHaveBeenCalled()
  })

  it('renders the path to redirect if user is not logged in', () => {
    const isAuthenticatedSpy = jest.spyOn(auth, 'isAuthenticated').mockImplementation(() => false)

    store = createStore()
    mountWithRedux(store)(
      <HashRouter>
        <Routes>
          <Route
            path='/'
            element={
              <PrivateRoute redirectTo='/another'>
                <p>Component</p>
              </PrivateRoute>
            }
          />
          <Route exact path='/another' element={<p>Root route</p>} />
        </Routes>
      </HashRouter>
    )

    const component = screen.queryByText(/Root route/i)
    expect(component).toBeInTheDocument()
    expect(isAuthenticatedSpy).toHaveBeenCalled()
  })
})
