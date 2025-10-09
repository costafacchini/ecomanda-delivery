import path from 'path'
import loginRoutes from '@routes/login-route.js'
import resourcesRoutes from '@routes/resources-routes.js'
import apiRoutes from '@routes/api-routes.js'
import bullboardRoute from '@routes/bull-board-route.js'

function routes(app) {
  app.use('/resources', resourcesRoutes)
  app.use('/api', apiRoutes)
  app.use('/login', loginRoutes)
  app.use('/queue', bullboardRoute)
  app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'))
  })
}

export default routes
