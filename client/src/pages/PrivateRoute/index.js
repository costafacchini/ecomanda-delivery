import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import BaseLayout from '../BaseLayout/index'
import { isAuthenticated } from '../../services/auth'

export default function PrivateRoute({ component: Component, ...rest }) {
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