import { buildAuthenticateLicensee } from './authenticate-licensee'

function buildResponse() {
  return {
    json: jest.fn(),
    send: jest.fn(),
    sendStatus: jest.fn(),
    status: jest.fn().mockReturnThis(),
  }
}

describe('buildAuthenticateLicensee', () => {
  describe('without department param', () => {
    it('sets req.licensee and calls next when token is valid', async () => {
      const licensee = { _id: 'lic-id', apiToken: 'valid-token' }
      const licenseeRepository = { findFirst: jest.fn().mockResolvedValue(licensee) }
      const departmentRepository = { findFirst: jest.fn() }
      const inboxRepository = { findFirst: jest.fn().mockResolvedValue(null) }
      const middleware = buildAuthenticateLicensee({ licenseeRepository, departmentRepository, inboxRepository })

      const req: any = { query: { token: 'valid-token' }, path: '/v1/chat/message/' }
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
      const inboxRepository = { findFirst: jest.fn() }
      const middleware = buildAuthenticateLicensee({ licenseeRepository, departmentRepository, inboxRepository })

      const req: any = { query: {}, path: '/v1/chat/message/' }
      const res = buildResponse()
      const next = jest.fn()

      await middleware(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(next).not.toHaveBeenCalled()
    })

    it('returns 401 when token is invalid', async () => {
      const licenseeRepository = { findFirst: jest.fn().mockResolvedValue(null) }
      const departmentRepository = { findFirst: jest.fn() }
      const inboxRepository = { findFirst: jest.fn() }
      const middleware = buildAuthenticateLicensee({ licenseeRepository, departmentRepository, inboxRepository })

      const req: any = { query: { token: 'bad-token' }, path: '/v1/chat/message/' }
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
      const inboxRepository = { findFirst: jest.fn().mockResolvedValue(null) }
      const middleware = buildAuthenticateLicensee({ licenseeRepository, departmentRepository, inboxRepository })

      const req: any = { query: { token: 'valid-token', department: 'valid-department' }, path: '/v1/chat/message/' }
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
      const inboxRepository = { findFirst: jest.fn() }
      const middleware = buildAuthenticateLicensee({ licenseeRepository, departmentRepository, inboxRepository })

      const req: any = { query: { token: 'valid-token', department: 'other-department' }, path: '/v1/chat/message/' }
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
      const inboxRepository = { findFirst: jest.fn() }
      const middleware = buildAuthenticateLicensee({ licenseeRepository, departmentRepository, inboxRepository })

      const req: any = { query: { token: 'valid-token', department: 'valid-department' }, path: '/v1/chat/message/' }
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
      const inboxRepository = { findFirst: jest.fn() }
      const middleware = buildAuthenticateLicensee({ licenseeRepository, departmentRepository, inboxRepository })

      const req: any = { query: { token: 'valid-token', department: 'unknown' }, path: '/v1/chat/message/' }
      const res = buildResponse()
      const next = jest.fn()

      await middleware(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('Story 3 — inbox param routing', () => {
    it('Scenario 1: ?inbox=<token> resolves req.inbox and calls next', async () => {
      const licensee = { _id: 'lic-id', apiToken: 'valid-token' }
      const inbox = { _id: 'inbox-id', inboxToken: 'abc', licensee: 'lic-id', active: true }
      const licenseeRepository = { findFirst: jest.fn().mockResolvedValue(licensee) }
      const departmentRepository = { findFirst: jest.fn() }
      const inboxRepository = { findFirst: jest.fn().mockResolvedValue(inbox) }
      const middleware = buildAuthenticateLicensee({ licenseeRepository, departmentRepository, inboxRepository })

      const req: any = { query: { token: 'valid-token', inbox: 'abc' }, path: '/v1/messenger/message/' }
      const res = buildResponse()
      const next = jest.fn()

      await middleware(req, res, next)

      expect(inboxRepository.findFirst).toHaveBeenCalledWith({
        inboxToken: 'abc',
        licensee: 'lic-id',
        active: true,
      })
      expect(req.inbox).toEqual(inbox)
      expect(next).toHaveBeenCalled()
    })

    it('Scenario 2: no ?inbox or ?department — fallback sets req.inbox from first active messenger inbox', async () => {
      const licensee = { _id: 'lic-id', apiToken: 'valid-token' }
      const firstInbox = { _id: 'fallback-inbox-id', kind: 'messenger', licensee: 'lic-id', active: true }
      const licenseeRepository = { findFirst: jest.fn().mockResolvedValue(licensee) }
      const departmentRepository = { findFirst: jest.fn() }
      const inboxRepository = { findFirst: jest.fn().mockResolvedValue(firstInbox) }
      const middleware = buildAuthenticateLicensee({ licenseeRepository, departmentRepository, inboxRepository })

      const req: any = { query: { token: 'valid-token' }, path: '/v1/messenger/message/' }
      const res = buildResponse()
      const next = jest.fn()

      await middleware(req, res, next)

      expect(inboxRepository.findFirst).toHaveBeenCalledWith({
        licensee: 'lic-id',
        kind: 'messenger',
        active: true,
      })
      expect(req.inbox).toEqual(firstInbox)
      expect(next).toHaveBeenCalled()
    })

    it('Scenario 3: ?department=<token> still resolves req.department correctly', async () => {
      const licensee = { _id: 'lic-id', apiToken: 'valid-token' }
      const department = { _id: 'dep-id', departmentToken: 'dep-token', active: true, licensee: 'lic-id' }
      const licenseeRepository = { findFirst: jest.fn().mockResolvedValue(licensee) }
      const departmentRepository = { findFirst: jest.fn().mockResolvedValue(department) }
      const inboxRepository = { findFirst: jest.fn().mockResolvedValue(null) }
      const middleware = buildAuthenticateLicensee({ licenseeRepository, departmentRepository, inboxRepository })

      const req: any = { query: { token: 'valid-token', department: 'dep-token' }, path: '/v1/chat/message/' }
      const res = buildResponse()
      const next = jest.fn()

      await middleware(req, res, next)

      expect(req.department).toEqual(department)
      expect(next).toHaveBeenCalled()
    })

    it('Scenario 4: invalid inbox token returns 401', async () => {
      const licensee = { _id: 'lic-id', apiToken: 'valid-token' }
      const licenseeRepository = { findFirst: jest.fn().mockResolvedValue(licensee) }
      const departmentRepository = { findFirst: jest.fn() }
      const inboxRepository = { findFirst: jest.fn().mockResolvedValue(null) }
      const middleware = buildAuthenticateLicensee({ licenseeRepository, departmentRepository, inboxRepository })

      const req: any = { query: { token: 'valid-token', inbox: 'bad-inbox-token' }, path: '/v1/messenger/message/' }
      const res = buildResponse()
      const next = jest.fn()

      await middleware(req, res, next)

      expect(res.sendStatus).toHaveBeenCalledWith(401)
      expect(next).not.toHaveBeenCalled()
    })
  })
})
