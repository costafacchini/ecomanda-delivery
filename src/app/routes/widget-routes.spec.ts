import request from 'supertest'
import express from 'express'

jest.mock('../../config/queue', () => ({ queueServer: {} }))
jest.mock('../../config/redis', () => ({ redisConnection: {} }))

// Stub all repositories so the module can be imported without a live DB.
jest.mock('../runtime/dependencies', () => {
  const deps = {
    licenseeRepository: { findFirst: jest.fn() },
    contactRepository: { findFirst: jest.fn(), create: jest.fn(), save: jest.fn() },
    messageRepository: { create: jest.fn(), findByRoom: jest.fn() },
    roomRepository: { findOpenForContact: jest.fn() },
  }
  return { createRuntimeDependencies: jest.fn(() => deps) }
})

// Stub widget use cases. jest.mock factories run before variable declarations
// (hoisting), so we use module-level jest.fn() assigned inside the factory
// rather than referencing outer variables.
jest.mock('../usecases/widget/CreateWidgetSession', () => {
  const execute = jest.fn()
  const ctor = jest.fn().mockImplementation(() => ({ execute }))
  // Attach the execute stub to the constructor so tests can reach it.
  ;(ctor as any).__execute = execute
  return { CreateWidgetSession: ctor }
})

jest.mock('../usecases/widget/SendWidgetMessage', () => {
  const execute = jest.fn()
  const ctor = jest.fn().mockImplementation(() => ({ execute }))
  ;(ctor as any).__execute = execute
  return { SendWidgetMessage: ctor }
})

jest.mock('../usecases/widget/GetWidgetMessages', () => {
  const execute = jest.fn()
  const ctor = jest.fn().mockImplementation(() => ({ execute }))
  ;(ctor as any).__execute = execute
  return { GetWidgetMessages: ctor }
})

import widgetRouter from './widget-routes'
import { CreateWidgetSession } from '../usecases/widget/CreateWidgetSession'
import { SendWidgetMessage } from '../usecases/widget/SendWidgetMessage'
import { GetWidgetMessages } from '../usecases/widget/GetWidgetMessages'

// Reach the pre-attached execute stubs via the constructor mock's __execute property.
const mockCreateSession = (CreateWidgetSession as any).__execute as jest.Mock
const mockSendMessage = (SendWidgetMessage as any).__execute as jest.Mock
const mockGetMessages = (GetWidgetMessages as any).__execute as jest.Mock

const app = express()
app.use(express.json())
app.use('/widget', widgetRouter)

const API_TOKEN = 'test-api-token'

beforeEach(() => {
  jest.clearAllMocks()
})

// ---------------------------------------------------------------------------
// POST /widget/:token/session
// ---------------------------------------------------------------------------
describe('POST /widget/:token/session', () => {
  it('returns 200 with session data for valid body', async () => {
    const sessionData = { widgetSessionToken: 'tok-123', contactId: 'c1', licenseeId: 'l1' }
    mockCreateSession.mockResolvedValue(sessionData)

    const res = await request(app)
      .post(`/widget/${API_TOKEN}/session`)
      .send({ name: 'Alan', email: 'alan@example.com' })

    expect(res.status).toBe(200)
    expect(res.body).toEqual(sessionData)
  })

  it('returns 422 when email is missing', async () => {
    const res = await request(app).post(`/widget/${API_TOKEN}/session`).send({ name: 'Alan' })

    expect(res.status).toBe(422)
    expect(res.body).toMatchObject({ errors: expect.arrayContaining([{ message: expect.any(String) }]) })
  })

  it('returns 422 when name is missing', async () => {
    const res = await request(app).post(`/widget/${API_TOKEN}/session`).send({ email: 'alan@example.com' })

    expect(res.status).toBe(422)
    expect(res.body.errors[0]).toHaveProperty('message')
  })

  it('returns 404 when use case throws a not-found error', async () => {
    mockCreateSession.mockRejectedValue(new Error('Licensee not found for token: bad'))

    const res = await request(app)
      .post(`/widget/${API_TOKEN}/session`)
      .send({ name: 'Alan', email: 'alan@example.com' })

    expect(res.status).toBe(404)
  })
})

// ---------------------------------------------------------------------------
// POST /widget/:token/messages
// ---------------------------------------------------------------------------
describe('POST /widget/:token/messages', () => {
  it('returns 201 with the created message for valid body', async () => {
    const message = { _id: 'msg-1', text: 'Hello', kind: 'text' }
    mockSendMessage.mockResolvedValue(message)

    const res = await request(app)
      .post(`/widget/${API_TOKEN}/messages`)
      .send({ widgetSessionToken: 'tok-123', text: 'Hello' })

    expect(res.status).toBe(201)
    expect(res.body).toEqual(message)
  })

  it('returns 422 when widgetSessionToken is missing', async () => {
    const res = await request(app).post(`/widget/${API_TOKEN}/messages`).send({ text: 'Hello' })

    expect(res.status).toBe(422)
    expect(res.body).toMatchObject({ errors: expect.arrayContaining([{ message: expect.any(String) }]) })
  })

  it('returns 422 when text is missing', async () => {
    const res = await request(app).post(`/widget/${API_TOKEN}/messages`).send({ widgetSessionToken: 'tok-123' })

    expect(res.status).toBe(422)
  })
})

// ---------------------------------------------------------------------------
// GET /widget/:token/messages
// ---------------------------------------------------------------------------
describe('GET /widget/:token/messages', () => {
  it('returns 200 with messages array when sessionToken is provided', async () => {
    mockGetMessages.mockResolvedValue([])

    const res = await request(app).get(`/widget/${API_TOKEN}/messages`).query({ sessionToken: 'tok-123' })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ messages: [] })
  })

  it('returns 422 when sessionToken query param is missing', async () => {
    const res = await request(app).get(`/widget/${API_TOKEN}/messages`)

    expect(res.status).toBe(422)
    expect(res.body).toMatchObject({ errors: expect.arrayContaining([{ message: expect.any(String) }]) })
  })

  it('returns 404 when use case throws a not-found error', async () => {
    mockGetMessages.mockRejectedValue(new Error('Widget session not found: bad-tok'))

    const res = await request(app).get(`/widget/${API_TOKEN}/messages`).query({ sessionToken: 'bad-tok' })

    expect(res.status).toBe(404)
  })
})
