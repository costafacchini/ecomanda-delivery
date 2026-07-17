import express from 'express'
import v1Routes from './v1/v1-routes'
import { LicenseeRepositoryDatabase } from '../repositories/licensee'
import { DepartmentRepositoryDatabase } from '../repositories/department'

const router = express.Router()
const licenseeRepository = new LicenseeRepositoryDatabase()
const departmentRepository = new DepartmentRepositoryDatabase()

export function buildAuthenticateLicensee({ licenseeRepository, departmentRepository }: any) {
  return async function authenticateLicensee(req: any, res: any, next: any) {
    if (req.query.token) {
      const licensee = await licenseeRepository.findFirst({ apiToken: req.query.token })
      if (licensee) {
        req.licensee = licensee

        if (req.query.department) {
          const department = await departmentRepository.findFirst({
            departmentToken: req.query.department,
            licensee: licensee._id,
          })
          if (!department || !department.active) {
            return res.status(401).json({ message: 'Token de departamento inválido ou inativo.' })
          }
          req.department = department
        }

        return next()
      }
    }

    res.status(401).json({ message: 'Token não informado ou inválido.' })
  }
}

router.use(buildAuthenticateLicensee({ licenseeRepository, departmentRepository }))

router.use('/v1', v1Routes)

export default router
