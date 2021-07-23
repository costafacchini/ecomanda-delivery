import React from 'react'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import SignIn from './SignIn'
import LicenseesRoutes from './Licensees/routes'
import Dashboard from './Dashboard'

import { isAuthenticated } from '../services/auth'

function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={props =>
        isAuthenticated() ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: '/', state: { from: props.location } }} />
        )
      }
    />
  )
}

function Routes() {
  return (
    <BrowserRouter>
      <Switch>
        <Route
          exact
          path='/'
          render={props =>
            isAuthenticated() ? (
              <Dashboard/>
            ) : (
              <Redirect to={{ pathname: '/signin', state: { from: props.location } }} />
            )
          }
        />
        <Route exact path='/signin' component={SignIn} />
        <PrivateRoute path='/#/' component={Dashboard} />
        <PrivateRoute path='/#/licensees' component={LicenseesRoutes} />
        <Route path='*' component={() => <h1>Page not found</h1>} />
      </Switch>
    </BrowserRouter>
  )
}

export default Routes