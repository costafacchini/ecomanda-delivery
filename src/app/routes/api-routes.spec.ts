import { buildAuthenticateLicensee } from './api-routes'

function buildResponse() {
  return {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
  }
}

describe('buildAuthenticateLicensee', () => {
  describe('without department param', () => {
    it('sets req.licensee and calls next when token is valid', async () => {
      const licensee = { _id: 'lic-id', apiToken: 'valid-token' }
      const licenseeRepository = { findFirst: jest.fn().mockResolvedValue(licensee) }
      const departmentRepository = { findFirst: jest.fn() }
      const middleware = buildAuthenticateLicensee({ licenseeRepository, departmentRepository })

      const req: any = { query: { token: 'valid-token' } }
      const res = buildResponse()
      const next = jest.fn()

      await middleware(req, res, next)

      expect(req.licensee).toEqual(licensee)
      expect(req.department).toBeUndefined()
      expect(next).toHaveBeenCalled()
      expect(res.status).not.toHaveBeenCalled()
    })

    it('returns 401 when token is missing', async () => {
      const licenseeRepository = { findFirst: jest.fn() }
      const departmentRepository = { findFirst: jest.fn() }
      const middleware = buildAuthenticateLicensee({ licenseeRepository, departmentRepository })

      const req: any = { query: {} }
      const res = buildResponse()
      const next = jest.fn()

      await middleware(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(next).not.toHaveBeenCalled()
    })

    it('returns 401 when token is invalid', async () => {
      const licenseeRepository = { findFirst: jest.fn().mockResolvedValue(null) }
      const departmentRepository = { findFirst: jest.fn() }
      const middleware = buildAuthenticateLicensee({ licenseeRepository, departmentRepository })

      const req: any = { query: { token: 'bad-token' } }
      const res = buildResponse()
      const next = jest.fn()

      await middleware(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('with department param', () => {
    it('sets req.department and calls next when department token is valid and active', async () => {
      const licensee = { _id: 'lic-id', apiToken: 'valid-token' }
      const department = { _id: 'sec-id', departmentToken: 'valid-department', active: true, licensee: 'lic-id' }
      const licenseeRepository = { findFirst: jest.fn().mockResolvedValue(licensee) }
      const departmentRepository = { findFirst: jest.fn().mockResolvedValue(department) }
      const middleware = buildAuthenticateLicensee({ licenseeRepository, departmentRepository })

      const req: any = { query: { token: 'valid-token', department: 'valid-department' } }
      const res = buildResponse()
      const next = jest.fn()

      await middleware(req, res, next)

      expect(departmentRepository.findFirst).toHaveBeenCalledWith({
        departmentToken: 'valid-department',
        licensee: 'lic-id',
      })
      expect(req.department).toEqual(department)
      expect(next).toHaveBeenCalled()
    })

    it('returns 401 when department token belongs to a different licensee', async () => {
      const licensee = { _id: 'lic-id', apiToken: 'valid-token' }
      const licenseeRepository = { findFirst: jest.fn().mockResolvedValue(licensee) }
      const departmentRepository = { findFirst: jest.fn().mockResolvedValue(null) }
      const middleware = buildAuthenticateLicensee({ licenseeRepository, departmentRepository })

      const req: any = { query: { token: 'valid-token', department: 'other-department' } }
      const res = buildResponse()
      const next = jest.fn()

      await middleware(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(next).not.toHaveBeenCalled()
    })

    it('returns 401 when department is inactive', async () => {
      const licensee = { _id: 'lic-id', apiToken: 'valid-token' }
      const department = { _id: 'sec-id', departmentToken: 'valid-department', active: false, licensee: 'lic-id' }
      const licenseeRepository = { findFirst: jest.fn().mockResolvedValue(licensee) }
      const departmentRepository = { findFirst: jest.fn().mockResolvedValue(department) }
      const middleware = buildAuthenticateLicensee({ licenseeRepository, departmentRepository })

      const req: any = { query: { token: 'valid-token', department: 'valid-department' } }
      const res = buildResponse()
      const next = jest.fn()

      await middleware(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(next).not.toHaveBeenCalled()
    })

    it('returns 401 when department token is unknown', async () => {
      const licensee = { _id: 'lic-id', apiToken: 'valid-token' }
      const licenseeRepository = { findFirst: jest.fn().mockResolvedValue(licensee) }
      const departmentRepository = { findFirst: jest.fn().mockResolvedValue(null) }
      const middleware = buildAuthenticateLicensee({ licenseeRepository, departmentRepository })

      const req: any = { query: { token: 'valid-token', department: 'unknown' } }
      const res = buildResponse()
      const next = jest.fn()

      await middleware(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(next).not.toHaveBeenCalled()
    })
  })
})
