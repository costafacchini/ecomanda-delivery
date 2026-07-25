import express from 'express'
import v1Routes from './v1/v1-routes'
import { LicenseeRepositoryDatabase } from '../repositories/licensee'
import { DepartmentRepositoryDatabase } from '../repositories/department'
import { InboxRepositoryDatabase } from '../repositories/inbox'
import { buildAuthenticateLicensee } from './authenticate-licensee'

export { buildAuthenticateLicensee }

const router = express.Router()
const licenseeRepository = new LicenseeRepositoryDatabase()
const departmentRepository = new DepartmentRepositoryDatabase()
const inboxRepository = new InboxRepositoryDatabase()

router.use(buildAuthenticateLicensee({ licenseeRepository, departmentRepository, inboxRepository }))

router.use('/v1', v1Routes)

export default router
