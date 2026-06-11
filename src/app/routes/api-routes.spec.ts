import { buildAuthenticateLicensee } from './api-routes'

function buildResponse() {
  return {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
  }
}

describe('buildAuthenticateLicensee', () => {
  describe('without sector param', () => {
    it('sets req.licensee and calls next when token is valid', async () => {
      const licensee = { _id: 'lic-id', apiToken: 'valid-token' }
      const licenseeRepository = { findFirst: jest.fn().mockResolvedValue(licensee) }
      const sectorRepository = { findFirst: jest.fn() }
      const middleware = buildAuthenticateLicensee({ licenseeRepository, sectorRepository })

      const req: any = { query: { token: 'valid-token' } }
      const res = buildResponse()
      const next = jest.fn()

      await middleware(req, res, next)

      expect(req.licensee).toEqual(licensee)
      expect(req.sector).toBeUndefined()
      expect(next).toHaveBeenCalled()
      expect(res.status).not.toHaveBeenCalled()
    })

    it('returns 401 when token is missing', async () => {
      const licenseeRepository = { findFirst: jest.fn() }
      const sectorRepository = { findFirst: jest.fn() }
      const middleware = buildAuthenticateLicensee({ licenseeRepository, sectorRepository })

      const req: any = { query: {} }
      const res = buildResponse()
      const next = jest.fn()

      await middleware(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(next).not.toHaveBeenCalled()
    })

    it('returns 401 when token is invalid', async () => {
      const licenseeRepository = { findFirst: jest.fn().mockResolvedValue(null) }
      const sectorRepository = { findFirst: jest.fn() }
      const middleware = buildAuthenticateLicensee({ licenseeRepository, sectorRepository })

      const req: any = { query: { token: 'bad-token' } }
      const res = buildResponse()
      const next = jest.fn()

      await middleware(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('with sector param', () => {
    it('sets req.sector and calls next when sector token is valid and active', async () => {
      const licensee = { _id: 'lic-id', apiToken: 'valid-token' }
      const sector = { _id: 'sec-id', sectorToken: 'valid-sector', active: true, licensee: 'lic-id' }
      const licenseeRepository = { findFirst: jest.fn().mockResolvedValue(licensee) }
      const sectorRepository = { findFirst: jest.fn().mockResolvedValue(sector) }
      const middleware = buildAuthenticateLicensee({ licenseeRepository, sectorRepository })

      const req: any = { query: { token: 'valid-token', sector: 'valid-sector' } }
      const res = buildResponse()
      const next = jest.fn()

      await middleware(req, res, next)

      expect(sectorRepository.findFirst).toHaveBeenCalledWith({
        sectorToken: 'valid-sector',
        licensee: 'lic-id',
      })
      expect(req.sector).toEqual(sector)
      expect(next).toHaveBeenCalled()
    })

    it('returns 401 when sector token belongs to a different licensee', async () => {
      const licensee = { _id: 'lic-id', apiToken: 'valid-token' }
      const licenseeRepository = { findFirst: jest.fn().mockResolvedValue(licensee) }
      const sectorRepository = { findFirst: jest.fn().mockResolvedValue(null) }
      const middleware = buildAuthenticateLicensee({ licenseeRepository, sectorRepository })

      const req: any = { query: { token: 'valid-token', sector: 'other-sector' } }
      const res = buildResponse()
      const next = jest.fn()

      await middleware(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(next).not.toHaveBeenCalled()
    })

    it('returns 401 when sector is inactive', async () => {
      const licensee = { _id: 'lic-id', apiToken: 'valid-token' }
      const sector = { _id: 'sec-id', sectorToken: 'valid-sector', active: false, licensee: 'lic-id' }
      const licenseeRepository = { findFirst: jest.fn().mockResolvedValue(licensee) }
      const sectorRepository = { findFirst: jest.fn().mockResolvedValue(sector) }
      const middleware = buildAuthenticateLicensee({ licenseeRepository, sectorRepository })

      const req: any = { query: { token: 'valid-token', sector: 'valid-sector' } }
      const res = buildResponse()
      const next = jest.fn()

      await middleware(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(next).not.toHaveBeenCalled()
    })

    it('returns 401 when sector token is unknown', async () => {
      const licensee = { _id: 'lic-id', apiToken: 'valid-token' }
      const licenseeRepository = { findFirst: jest.fn().mockResolvedValue(licensee) }
      const sectorRepository = { findFirst: jest.fn().mockResolvedValue(null) }
      const middleware = buildAuthenticateLicensee({ licenseeRepository, sectorRepository })

      const req: any = { query: { token: 'valid-token', sector: 'unknown' } }
      const res = buildResponse()
      const next = jest.fn()

      await middleware(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(next).not.toHaveBeenCalled()
    })
  })
})
