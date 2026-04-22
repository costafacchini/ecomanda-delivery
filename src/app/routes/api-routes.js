import express from 'express'
import v1Routes from './v1/v1-routes.js'
import { LicenseeRepositoryDatabase } from '../repositories/licensee.js'

const router = express.Router()
const licenseeRepository = new LicenseeRepositoryDatabase()

function buildAuthenticateLicensee({ licenseeRepository }) {
  return async function authenticateLicensee(req, res, next) {
    if (req.query.token) {
      const licensee = await licenseeRepository.findFirst({ apiToken: req.query.token })
      if (licensee) {
        req.licensee = licensee
        return next()
      }
    }

    res.status(401).json({ message: 'Token não informado ou inválido.' })
  }
}

router.use(buildAuthenticateLicensee({ licenseeRepository }))

router.use('/v1', v1Routes)

export default router
