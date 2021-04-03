const loginRoutes = require('@routes/login-route')
const resourcesRoutes = require('@routes/resources-routes')
const apiRoutes = require('@routes/api-routes')

function routes(app) {
  app.use('/resources', resourcesRoutes)
  app.use('/api', apiRoutes)
  app.use('/login', loginRoutes)
}

module.exports = routes
