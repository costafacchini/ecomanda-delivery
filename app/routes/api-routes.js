const express = require('express')
const Licensee = require('@models/licensee')
const router = express.Router()
const v1Routes = require('./v1/v1-routes')

router.use(async (req, res, next) => {
  return next()
  // if (req.query.token) {
  //   const licensee = await Licensee.findOne({ apiToken: req.query.token })
  //   if (licensee) {
  //     req.licensee = licensee
  //     return next()
  //   }
  // }

  res.sendStatus(401)
})

router.use('/v1', v1Routes)

module.exports = router
