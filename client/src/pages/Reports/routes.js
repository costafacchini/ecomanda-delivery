import React from 'react'
import { Route, Switch, withRouter, useRouteMatch } from 'react-router-dom'
import ReportsIndex from './scenes/Index'

function ReportsRoutes() {
  let match = useRouteMatch()

  return (
    <Switch>
      <Route exact path={`${match.path}`}>
        <ReportsIndex />
      </Route>
    </Switch>
  )
}

export default withRouter(ReportsRoutes)
