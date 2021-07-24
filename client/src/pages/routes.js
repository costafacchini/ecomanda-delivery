import React, { useEffect } from 'react'
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import SignIn from './SignIn'
import LicenseesRoutes from './Licensees/routes'
import Dashboard from './Dashboard'
import { isAuthenticated, fetchLoggedUser } from '../services/auth'
import { loadLoggedUser } from './SignIn/slice'
import BaseLayout from './BaseLayout/index'
import Configurations from './Configurations/index'

function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={props =>
        isAuthenticated() ? (
          <BaseLayout>
            <Component {...props} />
          </BaseLayout>
        ) : (
          <Redirect to={{ pathname: '/', state: { from: props.location } }} />
        )
      }
    />
  )
}

function Routes() {
  const dispatch = useDispatch()
  const loggedUser = useSelector(state => state.signin.loggedUser)

  console.log(isAuthenticated())

  useEffect(() => {
    if (isAuthenticated() && !loggedUser) {
      fetchLoggedUser().then(user => {
        dispatch(loadLoggedUser(user))
      })
    }
  }, [dispatch, loggedUser])

  return (
    <HashRouter>
      <Switch>
        <Route
          exact
          path='/'
          render={props =>
            isAuthenticated() ? (
              <BaseLayout>
                <Dashboard />
              </BaseLayout>
            ) : (
              <Redirect to={{ pathname: '/signin', state: { from: props.location } }} />
            )
          }
        />
        <Route exact path='/signin' component={SignIn} />
        <PrivateRoute exact path='/licensees' component={LicenseesRoutes} />
        <PrivateRoute exact path='/configurations' component={Configurations} />
        <Route path='*' component={() =>
          <BaseLayout>
            <h1>Essa página não existe.</h1>
          </BaseLayout>
        } />
      </Switch>
    </HashRouter>
  )
}

export default Routes