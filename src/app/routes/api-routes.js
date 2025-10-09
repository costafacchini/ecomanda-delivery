import router from 'express'.Router()
import v1Routes from './v1/v1-routes.js'
import { LicenseeRepositoryDatabase  } from '@repositories/licensee.js'

router.use(async (req, res, next) => {
  if (req.query.token) {
    const licenseeRepository = new LicenseeRepositoryDatabase()
    const licensee = await licenseeRepository.findFirst({ apiToken: req.query.token })
    if (licensee) {
      req.licensee = licensee
      return next()
    }
  }

  res.status(401).json({ message: 'Token não informado ou inválido.' })
})

router.use('/v1', v1Routes)

export default router
