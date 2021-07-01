import React from 'react'
import { Route, Switch, withRouter, useRouteMatch } from 'react-router-dom'
import LicenseesIndex from './scenes/Index'
import LicenseeNew from './scenes/New'
import LicenseeEdit from './scenes/Edit'

function LicenseesRoutes() {
  let match = useRouteMatch()

  return (
    <Switch>
      <Route path={`${match.path}/:id(\\d+)`}>
        <LicenseeEdit resourceId={match.params.id} />
      </Route>
      <Route path={`${match.path}/:id(\\d+)/new`}>
        <LicenseeNew disabled={false} />
      </Route>
      <Route exact path={`${match.path}`}>
        <LicenseesIndex />
      </Route>
    </Switch>
  )
}

export default withRouter(LicenseesRoutes)