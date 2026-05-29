import * as auth from './auth'
import * as apiModule from './api'
import { createContact, getContacts, getContact, updateContact } from './contact'

vi.mock('./auth')
vi.mock('./api')

describe('contact service', () => {
  let mockGet, mockPost

  beforeEach(() => {
    mockGet = vi.fn().mockResolvedValue({ data: [] })
    mockPost = vi.fn().mockResolvedValue({ data: {} })
    apiModule.default.mockReturnValue({ get: mockGet, post: mockPost })
    auth.getToken.mockReturnValue('test-token')
  })

  it('reads the token at call time, not at module initialization', async () => {
    auth.getToken.mockReturnValue('token-after-login')
    await getContacts({})
    expect(mockGet).toHaveBeenCalledWith(
      expect.any(String),
      { headers: { 'x-access-token': 'token-after-login' } }
    )
  })

  describe('getContacts', () => {
    it('sends GET to resources/contacts/ with auth header and query params', async () => {
      await getContacts({ page: 1 })
      expect(mockGet).toHaveBeenCalledWith(
        'resources/contacts/?page=1',
        { headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('getContact', () => {
    it('sends GET to resources/contacts/:id with auth header', async () => {
      await getContact('abc123')
      expect(mockGet).toHaveBeenCalledWith(
        'resources/contacts/abc123',
        { headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('createContact', () => {
    it('sends POST to resources/contacts/ with auth header and body', async () => {
      const values = { name: 'Alice', number: '5511999999999' }
      await createContact(values)
      expect(mockPost).toHaveBeenCalledWith(
        'resources/contacts/',
        { body: values, headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('updateContact', () => {
    it('sends POST to resources/contacts/:id with auth header and body', async () => {
      const contact = { id: 'abc123', name: 'Alice Updated' }
      await updateContact(contact)
      expect(mockPost).toHaveBeenCalledWith(
        'resources/contacts/abc123',
        { headers: { 'x-access-token': 'test-token' }, body: contact }
      )
    })
  })
})
