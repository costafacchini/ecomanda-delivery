import { router as loginRoutes } from '../app/routes/login-route.js'
import resourcesRoutes from '../app/routes/resources-routes.js'
import apiRoutes from '../app/routes/api-routes.js'
import bullboardRoute from '../app/routes/bull-board-route.js'
import { frontendIndexFile } from './frontend-paths.js'

function routes(app) {
  app.use('/resources', resourcesRoutes)
  app.use('/api', apiRoutes)
  app.use('/login', loginRoutes)
  app.use('/queue', bullboardRoute)
  app.get(/.*/, (req, res) => {
    res.sendFile(frontendIndexFile)
  })
}

export { routes }
