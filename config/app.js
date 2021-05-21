require('module-alias/register')

const createError = require('http-errors')
const express = require('express')
const logger = require('morgan')
const connect = require('./database.js')
const enableCors = require('./cors')
const routes = require('./routes')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(logger('dev'))
connect()
enableCors(app)
routes(app)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
if (process.env.ROLLBAR_ACCESS_TOKEN) {
  const Rollbar = require('rollbar')
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

module.exports = app
