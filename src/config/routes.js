import path from 'path'
import { router as loginRoutes } from '../app/routes/login-route.js'
import resourcesRoutes from '../app/routes/resources-routes.js'
import apiRoutes from '../app/routes/api-routes.js'
import bullboardRoute from '../app/routes/bull-board-route.js'

function routes(app) {
  app.use('/resources', resourcesRoutes)
  app.use('/api', apiRoutes)
  app.use('/login', loginRoutes)
  app.use('/queue', bullboardRoute)
  app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'))
  })
}

export { routes }
