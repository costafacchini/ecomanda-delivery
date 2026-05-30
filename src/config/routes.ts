import jwt from 'jsonwebtoken'
import { router as loginRoutes } from '../app/routes/login-route'
import resourcesRoutes from '../app/routes/resources-routes'
import apiRoutes from '../app/routes/api-routes'
import bullboardRoute from '../app/routes/bull-board-route'
import { frontendIndexFile } from './frontend-paths'

const SECRET = process.env.SECRET

function requireCookieAuth(req, res, next) {
  const token = req.cookies?.access_token
  if (!token) return res.status(401).send('Não autorizado.')

  jwt.verify(token, SECRET, (err) => {
    if (err) return res.status(401).send('Token inválido.')
    next()
  })
}

function routes(app) {
  app.use('/resources', resourcesRoutes)
  app.use('/api', apiRoutes)
  app.use('/login', loginRoutes)
  app.use('/queue', requireCookieAuth, bullboardRoute)
  app.get(/.*/, (req, res) => {
    res.sendFile(frontendIndexFile)
  })
}

export { routes }
