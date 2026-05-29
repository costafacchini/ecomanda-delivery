import * as auth from './auth'
import * as apiModule from './api'
import { createUser, getUsers, getUser, updateUser } from './user'

vi.mock('./auth')
vi.mock('./api')

describe('user service', () => {
  let mockGet, mockPost

  beforeEach(() => {
    mockGet = vi.fn().mockResolvedValue({ data: [] })
    mockPost = vi.fn().mockResolvedValue({ data: {} })
    apiModule.default.mockReturnValue({ get: mockGet, post: mockPost })
    auth.getToken.mockReturnValue('test-token')
  })

  it('reads the token at call time, not at module initialization', async () => {
    auth.getToken.mockReturnValue('token-after-login')
    await getUsers({})
    expect(mockGet).toHaveBeenCalledWith(
      expect.any(String),
      { headers: { 'x-access-token': 'token-after-login' } }
    )
  })

  describe('getUsers', () => {
    it('sends GET to resources/users/ with auth header and query params', async () => {
      await getUsers({ page: 1 })
      expect(mockGet).toHaveBeenCalledWith(
        'resources/users/?page=1',
        { headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('getUser', () => {
    it('sends GET to resources/users/:id with auth header', async () => {
      await getUser('user-id')
      expect(mockGet).toHaveBeenCalledWith(
        'resources/users/user-id',
        { headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('createUser', () => {
    it('sends POST to resources/users/ with auth header and body', async () => {
      const values = { name: 'Bob', email: 'bob@example.com' }
      await createUser(values)
      expect(mockPost).toHaveBeenCalledWith(
        'resources/users/',
        { body: values, headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('updateUser', () => {
    it('sends POST to resources/users/:id with auth header and body', async () => {
      const user = { id: 'user-id', name: 'Bob Updated' }
      await updateUser(user)
      expect(mockPost).toHaveBeenCalledWith(
        'resources/users/user-id',
        { headers: { 'x-access-token': 'test-token' }, body: user }
      )
    })
  })
})
