import { HashRouter, Routes, Route } from 'react-router'
import { screen, render } from '@testing-library/react'
import PrivateRoute from '../PrivateRoute'
import * as auth from '../../services/auth'
import { AppContextProvider } from '../../contexts/App'

describe('<PrivateRoute>', () => {
  beforeEach(() => { jest.clearAllMocks() })

  it('renders the component if user is logged in', () => {
    const isAuthenticatedSpy = jest.spyOn(auth, 'isAuthenticated').mockImplementation(() => true)

    render(
      <AppContextProvider>
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
              <Route path='/another' element={<p>Root route</p>} />
            </Routes>
        </HashRouter>
      </AppContextProvider>
    )

    const component = screen.getByText(/Component/i)

    expect(component).toBeInTheDocument()
    expect(isAuthenticatedSpy).toHaveBeenCalled()
  })

  it('renders the path to redirect if user is not logged in', () => {
    const isAuthenticatedSpy = jest.spyOn(auth, 'isAuthenticated').mockImplementation(() => false)

    render(
      <AppContextProvider>
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
            <Route path='/another' element={<p>Root route</p>} />
          </Routes>
        </HashRouter>
      </AppContextProvider>
    )

    const component = screen.queryByText(/Root route/i)
    expect(component).toBeInTheDocument()
    expect(isAuthenticatedSpy).toHaveBeenCalled()
  })
})
