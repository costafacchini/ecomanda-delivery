require('dotenv').config()

const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
if(process.env.ROLLBAR_ACCESS_TOKEN) {
  const Rollbar = require("rollbar")
  const rollbar = new Rollbar({
    accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true
  })

  app.use(rollbar.errorHandler())
} else {
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.status(err.status || 500).send(err)
  })
}

module.exports = app