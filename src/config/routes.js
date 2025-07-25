const path = require('path')
const loginRoutes = require('@routes/login-route')
const resourcesRoutes = require('@routes/resources-routes')
const apiRoutes = require('@routes/api-routes')
const bullboardRoute = require('@routes/bull-board-route')

function routes(app) {
  app.use('/resources', resourcesRoutes)
  app.use('/api', apiRoutes)
  app.use('/login', loginRoutes)
  app.use('/queue', bullboardRoute)
  app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'))
  })
}

module.exports = routes
