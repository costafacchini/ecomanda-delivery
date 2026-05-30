import * as auth from './auth'
import * as apiModule from './api'
import { createTemplate, getTemplates, getTemplate, updateTemplate, importTemplates } from './template'

vi.mock('./auth')
vi.mock('./api')

describe('template service', () => {
  let mockGet, mockPost

  beforeEach(() => {
    mockGet = vi.fn().mockResolvedValue({ data: [] })
    mockPost = vi.fn().mockResolvedValue({ data: {} })
    apiModule.default.mockReturnValue({ get: mockGet, post: mockPost })
    auth.getToken.mockReturnValue('test-token')
  })

  it('reads the token at call time, not at module initialization', async () => {
    auth.getToken.mockReturnValue('token-after-login')
    await getTemplates({})
    expect(mockGet).toHaveBeenCalledWith(
      expect.any(String),
      { headers: { 'x-access-token': 'token-after-login' } }
    )
  })

  describe('getTemplates', () => {
    it('sends GET to resources/templates/ with auth header and query params', async () => {
      await getTemplates({ page: 1 })
      expect(mockGet).toHaveBeenCalledWith(
        'resources/templates/?page=1',
        { headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('getTemplate', () => {
    it('sends GET to resources/templates/:id with auth header', async () => {
      await getTemplate('tpl-id')
      expect(mockGet).toHaveBeenCalledWith(
        'resources/templates/tpl-id',
        { headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('createTemplate', () => {
    it('sends POST to resources/templates/ with auth header and body', async () => {
      const values = { name: 'My Template', content: 'Hello {{name}}' }
      await createTemplate(values)
      expect(mockPost).toHaveBeenCalledWith(
        'resources/templates/',
        { body: values, headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('updateTemplate', () => {
    it('sends POST to resources/templates/:id with auth header and body', async () => {
      const template = { id: 'tpl-id', name: 'Updated' }
      await updateTemplate(template)
      expect(mockPost).toHaveBeenCalledWith(
        'resources/templates/tpl-id',
        { headers: { 'x-access-token': 'test-token' }, body: template }
      )
    })
  })

  describe('importTemplates', () => {
    it('sends POST to resources/templates/:id/importation/ with auth header and body', async () => {
      const values = { file: 'data' }
      await importTemplates('tpl-id', values)
      expect(mockPost).toHaveBeenCalledWith(
        'resources/templates/tpl-id/importation/',
        { headers: { 'x-access-token': 'test-token' }, body: values }
      )
    })
  })
})
