const express = require('express')
const router = express.Router()
const v1Routes = require('./v1/v1-routes')

router.use((req, res, next) => {
  if (req.query.token && req.query.token.toUpperCase().match(TOKEN.toUpperCase())) {
    return next()
  }

  res.sendStatus(401)
})

router.use('/v1', v1Routes)

module.exports = router
