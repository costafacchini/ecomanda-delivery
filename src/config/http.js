import path from 'path'
import 'module-alias/register'
import '@models/index'

import createError from 'http-errors'
import express from 'express'
import logger from 'morgan'
import connect from './database'
import enableCors from './cors'
import routes from './routes'
import http from 'http'
import { Server } from 'socket.io'
import Rollbar from 'rollbar'

const app = express()

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: false }))
app.use(logger('dev'))
connect()

app.use(express.static(path.resolve(__dirname, '../../client/build')))
enableCors(app)
routes(app)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
if (process.env.ROLLBAR_ACCESS_TOKEN) {
  const rollbar = new Rollbar({
    accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
  })

  app.use(rollbar.errorHandler())
} else {
  app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.status(err.status || 500).send(err)
  })
}

const server = http.createServer(app)

const io = new Server(server)
io.on('connection', (_) => {})

export default { server, io }
