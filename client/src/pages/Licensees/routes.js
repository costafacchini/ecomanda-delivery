import React from 'react'
import { Route, Switch, withRouter, useRouteMatch } from 'react-router-dom'
import LicenseesIndex from './scenes/Index'
import LicenseeNew from './scenes/New'
import LicenseeEdit from './scenes/Edit'

function LicenseesRoutes() {
  let match = useRouteMatch()

  return (
    <Switch>
      <Route exact path={`${match.path}/new`}>
        <LicenseeNew disabled={false} />
      </Route>
      <Route path={`${match.path}/:id(\\w+)`}>
        <LicenseeEdit resourceId={match} />
      </Route>
      <Route exact path={`${match.path}`}>
        <LicenseesIndex />
      </Route>
    </Switch>
  )
}

export default withRouter(LicenseesRoutes)
