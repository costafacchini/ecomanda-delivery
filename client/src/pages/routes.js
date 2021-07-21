import React from 'react'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
// import SignUp from './SignUp'
import SignIn from './SignIn'
// import UsersRoutes from './Users/routes'
import LicenseesRoutes from './Licensees/routes'

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
        <Route exact path='/' component={SignIn} />
        {/* <Route path='/signup' component={SignUp} /> */}
        {/* <PrivateRoute path='/users' component={UsersRoutes} /> */}
        <PrivateRoute exact path='/dashboard' component={() => <h1>AAAAAAAAAA</h1>} />
        <PrivateRoute path='/licensees' component={LicenseesRoutes} />
        <Route path='*' component={() => <h1>Page not found</h1>} />
      </Switch>
    </BrowserRouter>
  )
}

export default Routes