import React, { useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import SignIn from './SignIn'
import LicenseesRoutes from './Licensees/routes'
import ContactsRoutes from './Contacts/routes'
import TriggersRoutes from './Triggers/routes'
import MessagesRoutes from './Messages/routes'
import Dashboard from './Dashboard'
import { isAuthenticated, fetchLoggedUser } from '../services/auth'
import { loadLoggedUser } from './SignIn/slice'
import BaseLayout from './BaseLayout/index'
import Configurations from './Configurations/index'
import PrivateRoute from './PrivateRoute/index'

function RootRoutes() {
  const dispatch = useDispatch()
  const loggedUser = useSelector(state => state.signin.loggedUser)

  useEffect(() => {
    if (isAuthenticated() && !loggedUser) {
      fetchLoggedUser().then(user => {
        dispatch(loadLoggedUser(user))
      })
    }
  }, [dispatch, loggedUser])

  return (
    <HashRouter>
      <Routes>
        <Route
          exact
          path='/'
          element={
            <PrivateRoute redirectTo='/signin'>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route exact path='/signin' element={<SignIn />} />
        <Route
          path='/licensees/*'
          element={
            <PrivateRoute redirectTo='/'>
              <LicenseesRoutes />
            </PrivateRoute>
          }
        />
        <Route
          path='/contacts/*'
          element={
            <PrivateRoute redirectTo='/'>
              <ContactsRoutes />
            </PrivateRoute>
          }
        />
        <Route
          path='/triggers/*'
          element={
            <PrivateRoute redirectTo='/'>
              <TriggersRoutes />
            </PrivateRoute>
          }
        />
        <Route
          path='/messages/*'
          element={
            <PrivateRoute redirectTo='/'>
              <MessagesRoutes />
            </PrivateRoute>
          }
        />
        <Route
          exact path='/configurations'
          element={
            <PrivateRoute redirectTo='/'>
              <Configurations />
            </PrivateRoute>
          }
        />
        <Route
          path='*'
          element={
            <BaseLayout>
              <h1>Essa página não existe.</h1>
            </BaseLayout>
          }
        />
      </Routes>
    </HashRouter>
  )
}

export default RootRoutes
