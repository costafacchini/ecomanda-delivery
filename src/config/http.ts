import('../app/repositories/index')

import createError from 'http-errors'
import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import { logger as appLogger } from '../app/helpers/logger'
import { connect } from './database'
import { enableCors } from './cors'
import { routes } from './routes'
import { helmetConfig } from './security'
import http from 'http'
import { Server } from 'socket.io'
import Rollbar from 'rollbar'
import { frontendDistDir } from './frontend-paths'
import { expressErrorHandler } from '@appsignal/nodejs'

const app = express()

app.set('trust proxy', 1)

app.use(helmet(helmetConfig() as any))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: false }))
app.use(cookieParser())
app.use(logger('dev'))
connect()

app.use(express.static(frontendDistDir))
enableCors(app)
routes(app)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

app.use(expressErrorHandler())

// error handler
if (process.env.ROLLBAR_ACCESS_TOKEN) {
  const rollbar = new Rollbar({
    accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
  })

  app.use(rollbar.errorHandler())
} else {
  app.use(function (err: any, req: any, res: any, _next: any) {
    const status = err.status || 500
    appLogger.error('Unhandled error', err)
    res.status(status).json({ message: status < 500 ? err.message : 'Erro interno do servidor.' })
  })
}

const server = http.createServer(app)

const io = new Server(server)
io.on('connection', (_) => {})

export { server, io }
