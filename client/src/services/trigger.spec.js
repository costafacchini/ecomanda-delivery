import * as auth from './auth'
import * as apiModule from './api'
import { createTrigger, getTriggers, getTrigger, updateTrigger, importTriggerMultiProduct } from './trigger'

vi.mock('./auth')
vi.mock('./api')

describe('trigger service', () => {
  let mockGet, mockPost

  beforeEach(() => {
    mockGet = vi.fn().mockResolvedValue({ data: [] })
    mockPost = vi.fn().mockResolvedValue({ data: {} })
    apiModule.default.mockReturnValue({ get: mockGet, post: mockPost })
    auth.getToken.mockReturnValue('test-token')
  })

  it('reads the token at call time, not at module initialization', async () => {
    auth.getToken.mockReturnValue('token-after-login')
    await getTriggers({})
    expect(mockGet).toHaveBeenCalledWith(
      expect.any(String),
      { headers: { 'x-access-token': 'token-after-login' } }
    )
  })

  describe('getTriggers', () => {
    it('sends GET to resources/triggers/ with auth header and query params', async () => {
      await getTriggers({ page: 1 })
      expect(mockGet).toHaveBeenCalledWith(
        'resources/triggers/?page=1',
        { headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('getTrigger', () => {
    it('sends GET to resources/triggers/:id with auth header', async () => {
      await getTrigger('trg-id')
      expect(mockGet).toHaveBeenCalledWith(
        'resources/triggers/trg-id',
        { headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('createTrigger', () => {
    it('sends POST to resources/triggers/ with auth header and body', async () => {
      const values = { name: 'Black Friday', expression: 'bf2025' }
      await createTrigger(values)
      expect(mockPost).toHaveBeenCalledWith(
        'resources/triggers/',
        { body: values, headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('updateTrigger', () => {
    it('sends POST to resources/triggers/:id with auth header and body', async () => {
      const trigger = { id: 'trg-id', name: 'Updated Trigger' }
      await updateTrigger(trigger)
      expect(mockPost).toHaveBeenCalledWith(
        'resources/triggers/trg-id',
        { headers: { 'x-access-token': 'test-token' }, body: trigger }
      )
    })
  })

  describe('importTriggerMultiProduct', () => {
    it('sends POST to resources/triggers/:id/importation/ with auth header and body', async () => {
      const values = { products: ['a', 'b'] }
      await importTriggerMultiProduct('trg-id', values)
      expect(mockPost).toHaveBeenCalledWith(
        'resources/triggers/trg-id/importation/',
        { headers: { 'x-access-token': 'test-token' }, body: values }
      )
    })
  })
})
