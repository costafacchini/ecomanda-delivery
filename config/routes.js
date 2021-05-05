const loginRoutes = require('@routes/login-route')
const resourcesRoutes = require('@routes/resources-routes')
const apiRoutes = require('@routes/api-routes')
const bullboardRoute = require('@routes/bull-board-route')
const queueServer = require('@config/queue')

function routes(app) {
  app.use('/resources', resourcesRoutes)
  app.use('/api', apiRoutes)
  app.use('/login', loginRoutes)
  app.use('/queue', bullboardRoute)
  app.get('/teste', async (req, res, next) => {
    const a = () => {
      console.log('teste')
    }

    const b = {
      x: '1',
      fn: a
    }

    await queueServer.addJob('teste', { body: 'teste', more: b }, { licensee: '1' })
    // await queueServer.addJob('teste', { body: 'teste'}, { licensee: '2' })
    // await queueServer.addJob('teste', { body: 'teste'}, { licensee: '3' })
    // await queue.addJobDispatcher('teste', { body: 'teste', more: b}, { licensee: '1' })
    // await queue.addJobDispatcher('teste', { body: 'teste'}, { licensee: '2' })

    return res.json({ message: 'feito' })
  })
}

module.exports = routes
