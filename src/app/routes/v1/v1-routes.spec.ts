import request from 'supertest'
import express from 'express'

jest.mock('../../../config/queue', () => ({ queueServer: {} }))
jest.mock('../../../config/redis', () => ({ redisConnection: {} }))
jest.mock('../../../config/rabbitmq', () => ({ publishMessage: jest.fn() }))

// Stub all repositories and use-case factories so the module can be imported
// without a live database connection.
jest.mock('../../runtime/dependencies', () => {
  const contactRepository = { findFirst: jest.fn(), find: jest.fn() }
  const deps = {
    bodyRepository: { findFirst: jest.fn(), find: jest.fn(), create: jest.fn(), save: jest.fn() },
    contactRepository,
    backgroundjobRepository: { findFirst: jest.fn(), find: jest.fn(), create: jest.fn() },
  }
  return { createRuntimeDependencies: jest.fn(() => deps) }
})

// Stub use-cases that are instantiated at module load time.
jest.mock('../../usecases/webhooks/IngestChatMessage', () => ({
  IngestChatMessage: jest.fn().mockImplementation(() => ({})),
}))
jest.mock('../../usecases/webhooks/IngestMessengerMessage', () => ({
  IngestMessengerMessage: jest.fn().mockImplementation(() => ({})),
}))
jest.mock('../../usecases/contacts/UpdateContactAddress', () => ({
  UpdateContactAddress: jest.fn().mockImplementation(() => ({ execute: jest.fn() })),
}))
jest.mock('../../usecases/backgroundjobs/ScheduleBackgroundjob', () => ({
  ScheduleBackgroundjob: jest.fn().mockImplementation(() => ({ execute: jest.fn() })),
}))
jest.mock('../../usecases/backgroundjobs/GetBackgroundjobStatus', () => ({
  GetBackgroundjobStatus: jest.fn().mockImplementation(() => ({ execute: jest.fn() })),
}))
jest.mock('../../controllers/DelayController', () => ({
  DelayController: jest.fn().mockImplementation(() => ({
    time: jest.fn((_req, res) => res.sendStatus(200)),
  })),
}))

import v1Router from './v1-routes'

// Build a minimal app that injects req.licensee the same way api-routes.js does,
// but without the real DB lookup.
const STUB_LICENSEE = { _id: 'licensee-stub-id' }

const app = express()
app.use(express.json())
app.use((req, _res, next) => {
  req.licensee = STUB_LICENSEE
  next()
})
app.use('/v1', v1Router)

// ---------------------------------------------------------------------------
// GET /v1/delay/:time — delayValidations
// ---------------------------------------------------------------------------
describe('GET /v1/delay/:time — input validation', () => {
  it('returns 422 when time is not an integer', async () => {
    const res = await request(app).get('/v1/delay/abc')
    expect(res.status).toBe(422)
    expect(res.body).toMatchObject({ errors: expect.arrayContaining([{ message: expect.any(String) }]) })
  })

  it('returns 422 when time exceeds 30000', async () => {
    const res = await request(app).get('/v1/delay/99999')
    expect(res.status).toBe(422)
    expect(res.body.errors[0].message).toMatch(/30000/)
  })

  it('returns 422 when time is negative', async () => {
    const res = await request(app).get('/v1/delay/-1')
    expect(res.status).toBe(422)
  })

  it('accepts a valid integer time within range', async () => {
    const res = await request(app).get('/v1/delay/1000')
    expect(res.status).not.toBe(422)
  })

  it('accepts time = 0', async () => {
    const res = await request(app).get('/v1/delay/0')
    expect(res.status).not.toBe(422)
  })

  it('accepts time = 30000 (upper boundary)', async () => {
    const res = await request(app).get('/v1/delay/30000')
    expect(res.status).not.toBe(422)
  })
})

// ---------------------------------------------------------------------------
// POST /v1/delay/:time — same validation applies
// ---------------------------------------------------------------------------
describe('POST /v1/delay/:time — input validation', () => {
  it('returns 422 when time is not an integer', async () => {
    const res = await request(app).post('/v1/delay/notanumber').send({})
    expect(res.status).toBe(422)
  })

  it('accepts a valid integer time', async () => {
    const res = await request(app).post('/v1/delay/500').send({})
    expect(res.status).not.toBe(422)
  })
})
