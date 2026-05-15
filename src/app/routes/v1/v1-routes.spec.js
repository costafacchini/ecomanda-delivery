import request from 'supertest'
import express from 'express'

jest.mock('../../../config/queue.js', () => ({ queueServer: {} }))
jest.mock('../../../config/redis.js', () => ({ redisConnection: {} }))
jest.mock('../../../config/rabbitmq.js', () => ({ publishMessage: jest.fn() }))

// Stub all repositories and use-case factories so the module can be imported
// without a live database connection.
jest.mock('../../runtime/dependencies.js', () => {
  const contactRepository = { findFirst: jest.fn(), find: jest.fn() }
  const cartRepository = {
    findFirst: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  }
  const deps = {
    bodyRepository: { findFirst: jest.fn(), find: jest.fn(), create: jest.fn(), save: jest.fn() },
    contactRepository,
    cartRepository,
    messageRepository: { findFirst: jest.fn(), find: jest.fn() },
    backgroundjobRepository: { findFirst: jest.fn(), find: jest.fn(), create: jest.fn() },
    integrationlogRepository: { findFirst: jest.fn(), find: jest.fn(), create: jest.fn() },
    parseCart: jest.fn(),
    createCartPlugin: jest.fn(),
  }
  return { createRuntimeDependencies: jest.fn(() => deps) }
})

// Stub use-cases that are instantiated at module load time.
jest.mock('../../usecases/webhooks/IngestChatMessage.js', () => ({
  IngestChatMessage: jest.fn().mockImplementation(() => ({})),
}))
jest.mock('../../usecases/webhooks/IngestMessengerMessage.js', () => ({
  IngestMessengerMessage: jest.fn().mockImplementation(() => ({})),
}))
jest.mock('../../usecases/carts/CreateCart.js', () => ({
  CreateCart: jest.fn().mockImplementation(() => ({ execute: jest.fn() })),
}))
jest.mock('../../usecases/carts/UpdateCart.js', () => ({
  UpdateCart: jest.fn().mockImplementation(() => ({ execute: jest.fn() })),
}))
jest.mock('../../usecases/carts/AddCartItem.js', () => ({
  AddCartItem: jest.fn().mockImplementation(() => ({ execute: jest.fn() })),
}))
jest.mock('../../usecases/carts/SendCart.js', () => ({
  SendCart: jest.fn().mockImplementation(() => ({ execute: jest.fn() })),
}))
jest.mock('../../usecases/contacts/UpdateContactAddress.js', () => ({
  UpdateContactAddress: jest.fn().mockImplementation(() => ({ execute: jest.fn() })),
}))
jest.mock('../../usecases/backgroundjobs/ScheduleBackgroundjob.js', () => ({
  ScheduleBackgroundjob: jest.fn().mockImplementation(() => ({ execute: jest.fn() })),
}))
jest.mock('../../usecases/backgroundjobs/GetBackgroundjobStatus.js', () => ({
  GetBackgroundjobStatus: jest.fn().mockImplementation(() => ({ execute: jest.fn() })),
}))
jest.mock('../../usecases/orders/ReceivePedidos10Order.js', () => ({
  ReceivePedidos10Order: jest.fn().mockImplementation(() => ({ execute: jest.fn() })),
}))
jest.mock('../../usecases/orders/ChangePedidos10OrderStatus.js', () => ({
  ChangePedidos10OrderStatus: jest.fn().mockImplementation(() => ({ execute: jest.fn() })),
}))
jest.mock('../../plugins/carts/adapters/factory.js', () => ({ createCartAdapter: jest.fn() }))
jest.mock('../../repositories/messenger.js', () => ({ scheduleSendMessageToMessenger: jest.fn() }))
jest.mock('../../controllers/DelayController.js', () => ({
  DelayController: jest.fn().mockImplementation(() => ({
    time: jest.fn((_req, res) => res.sendStatus(200)),
  })),
}))

import v1Router from './v1-routes.js'

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
// POST /v1/carts — cartsCreateValidations
// ---------------------------------------------------------------------------
describe('POST /v1/carts — input validation', () => {
  it('accepts a request with a contact in body', async () => {
    // Controller create will attempt to run; the use-case is a jest.fn()
    // that resolves to undefined — the controller catches and returns 500.
    // What matters is NOT 422.
    const res = await request(app).post('/v1/carts').send({ contact: '5511999990000' })
    expect(res.status).not.toBe(422)
  })

  it('accepts a request with no body (contact is optional for POST /carts)', async () => {
    const res = await request(app).post('/v1/carts').send({})
    expect(res.status).not.toBe(422)
  })

  it('accepts a request with contact as query param', async () => {
    const res = await request(app).post('/v1/carts?contact=5511999990000').send({})
    expect(res.status).not.toBe(422)
  })
})

// ---------------------------------------------------------------------------
// POST /v1/carts/:contact/item — cartsAddItemValidations
// ---------------------------------------------------------------------------
describe('POST /v1/carts/:contact/item — input validation', () => {
  it('returns 422 when products is missing', async () => {
    const res = await request(app).post('/v1/carts/5511999990000/item').send({})
    expect(res.status).toBe(422)
    expect(res.body).toMatchObject({ errors: expect.arrayContaining([{ message: expect.any(String) }]) })
  })

  it('returns 422 when products is an empty array', async () => {
    const res = await request(app).post('/v1/carts/5511999990000/item').send({ products: [] })
    expect(res.status).toBe(422)
    expect(res.body.errors[0].message).toMatch(/products/)
  })

  it('accepts a valid request with products array', async () => {
    const res = await request(app)
      .post('/v1/carts/5511999990000/item')
      .send({ products: [{ id: 'product-1', quantity: 1 }] })
    expect(res.status).not.toBe(422)
  })
})

// ---------------------------------------------------------------------------
// POST /v1/orders — ordersCreateValidations
// ---------------------------------------------------------------------------
describe('POST /v1/orders — input validation', () => {
  it('returns 422 when MerchantExternalCode is missing', async () => {
    const res = await request(app)
      .post('/v1/orders')
      .send({ order: { id: 'ord-1' } })
    expect(res.status).toBe(422)
    expect(res.body.errors[0].message).toMatch(/MerchantExternalCode/)
  })

  it('returns 422 when order is missing', async () => {
    const res = await request(app).post('/v1/orders').send({ MerchantExternalCode: 'MC-001' })
    expect(res.status).toBe(422)
    expect(res.body.errors[0].message).toMatch(/order/)
  })

  it('returns 422 when both required fields are missing', async () => {
    const res = await request(app).post('/v1/orders').send({})
    expect(res.status).toBe(422)
    expect(res.body.errors.length).toBeGreaterThanOrEqual(2)
  })

  it('accepts a valid request with all required fields', async () => {
    const res = await request(app)
      .post('/v1/orders')
      .send({ MerchantExternalCode: 'MC-001', order: { id: 'ord-1' } })
    expect(res.status).not.toBe(422)
  })
})

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
