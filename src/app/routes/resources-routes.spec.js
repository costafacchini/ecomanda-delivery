import request from 'supertest'
import express from 'express'
import jwt from 'jsonwebtoken'

jest.mock('../../config/queue', () => ({ queueServer: {} }))
jest.mock('../../config/redis', () => ({ redisConnection: {} }))

// All stubs are defined inside the factory so they exist before the route module is imported.
// The userRepository object is shared by reference — tests mutate findFirst/find per case.
jest.mock('../runtime/dependencies.js', () => {
  const userRepository = {
    findFirst: jest.fn(),
    find: jest.fn(),
  }
  const deps = {
    userRepository,
    licenseeRepository: { findFirst: jest.fn(), find: jest.fn(), create: jest.fn(), save: jest.fn() },
    contactRepository: { findFirst: jest.fn(), find: jest.fn() },
    triggerRepository: { findFirst: jest.fn(), find: jest.fn() },
    templateRepository: { findFirst: jest.fn(), find: jest.fn() },
    messageRepository: { findFirst: jest.fn(), find: jest.fn() },
    roomRepository: { findFirst: jest.fn(), find: jest.fn() },
    whatsappSessionRepository: { findFirst: jest.fn() },
    createMessengerPlugin: jest.fn(),
    createPagarMe: jest.fn(),
    createPedidos10: jest.fn(),
    createFacebookCatalogImporter: jest.fn(),
    createTemplatesImporter: jest.fn(),
  }
  return {
    createRuntimeDependencies: jest.fn(() => deps),
  }
})

import { createRuntimeDependencies } from '../runtime/dependencies.js'
import resourcesRouter from './resources-routes.js'

// Extract the shared stubs object from the mock's first (and only) call result.
// The route module called createRuntimeDependencies() at import time.
const deps = createRuntimeDependencies.mock.results[0].value
const { userRepository } = deps

// Use the SECRET already loaded from .env by the test environment.
// The route module captures process.env.SECRET at import time, so we must use the same value.
const SECRET = process.env.SECRET

function signToken(payload) {
  return jwt.sign(payload, SECRET)
}

const app = express()
app.use(express.json())
app.use('/resources', resourcesRouter)

beforeEach(() => {
  jest.clearAllMocks()
  userRepository.find.mockResolvedValue([])
  deps.licenseeRepository.find.mockResolvedValue([])
})

describe('authenticate middleware', () => {
  it('returns 401 when no token header is provided', async () => {
    const res = await request(app).get('/resources/users')
    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ auth: false })
  })

  it('returns 401 (not 500) when the token is invalid or expired', async () => {
    const res = await request(app).get('/resources/users').set('x-access-token', 'bad.token.value')
    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ auth: false, message: 'Falha na autenticação com token.' })
  })
})

describe('requireSuper middleware — POST /users', () => {
  it('returns 403 when the authenticated user does not have isSuper', async () => {
    userRepository.findFirst.mockResolvedValue({ _id: 'uid-1', isSuper: false })
    const token = signToken({ id: 'uid-1' })

    const res = await request(app).post('/resources/users').set('x-access-token', token).send({})

    expect(res.status).toBe(403)
    expect(res.body).toMatchObject({ message: 'Acesso negado.' })
  })

  it('returns 403 when the user is not found in the database', async () => {
    userRepository.findFirst.mockResolvedValue(null)
    const token = signToken({ id: 'ghost-id' })

    const res = await request(app).post('/resources/users').set('x-access-token', token).send({})

    expect(res.status).toBe(403)
    expect(res.body).toMatchObject({ message: 'Acesso negado.' })
  })

  it('passes requireSuper and reaches controller validation when user is super', async () => {
    userRepository.findFirst.mockResolvedValue({ _id: 'super-id', isSuper: true })
    const token = signToken({ id: 'super-id' })

    // Controller will reject an empty body — but NOT with 403
    const res = await request(app).post('/resources/users').set('x-access-token', token).send({})

    expect(res.status).not.toBe(403)
  })
})

describe('requireSuper middleware — POST /licensees', () => {
  it('returns 403 for non-super user on POST /licensees', async () => {
    userRepository.findFirst.mockResolvedValue({ _id: 'uid-2', isSuper: false })
    const token = signToken({ id: 'uid-2' })

    const res = await request(app).post('/resources/licensees').set('x-access-token', token).send({})

    expect(res.status).toBe(403)
    expect(res.body).toMatchObject({ message: 'Acesso negado.' })
  })

  it('returns 403 for non-super user on POST /licensees/:id', async () => {
    userRepository.findFirst.mockResolvedValue({ _id: 'uid-3', isSuper: false })
    const token = signToken({ id: 'uid-3' })

    const res = await request(app).post('/resources/licensees/some-id').set('x-access-token', token).send({})

    expect(res.status).toBe(403)
  })
})

describe('GET endpoints — no requireSuper required', () => {
  it('GET /resources/users is accessible to non-super authenticated users', async () => {
    userRepository.findFirst.mockResolvedValue({ _id: 'uid-4', isSuper: false })
    userRepository.find.mockResolvedValue([])
    const token = signToken({ id: 'uid-4' })

    const res = await request(app).get('/resources/users').set('x-access-token', token)

    expect(res.status).not.toBe(403)
  })

  it('GET /resources/licensees is accessible to non-super authenticated users', async () => {
    userRepository.findFirst.mockResolvedValue({ _id: 'uid-5', isSuper: false })
    const token = signToken({ id: 'uid-5' })

    const res = await request(app).get('/resources/licensees').set('x-access-token', token)

    expect(res.status).not.toBe(403)
  })
})

describe('POST /licensees/:id/baileys-sync', () => {
  it('returns 401 when no token is provided', async () => {
    const res = await request(app).post('/resources/licensees/some-id/baileys-sync')

    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ auth: false })
  })

  it('is accessible to authenticated users and reaches the controller', async () => {
    userRepository.findFirst.mockResolvedValue({ _id: 'uid-6', isSuper: false })
    deps.licenseeRepository.findFirst.mockResolvedValue(null)
    const token = signToken({ id: 'uid-6' })

    const res = await request(app).post('/resources/licensees/some-id/baileys-sync').set('x-access-token', token)

    expect(res.status).not.toBe(401)
    expect(res.status).not.toBe(403)
  })
})
