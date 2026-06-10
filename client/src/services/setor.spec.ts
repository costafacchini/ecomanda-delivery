import * as auth from './auth'
import * as apiModule from './api'
import { getSetores, getSetor, createSetor, updateSetor, deleteSetor, getSetorBaileysStatus, getSetorBaileysQr, syncSetorBaileys } from './setor'

vi.mock('./auth')
vi.mock('./api')

describe('setor service', () => {
  let mockGet: any
  let mockPost: any
  let mockDelete: any

  beforeEach(() => {
    mockGet = vi.fn().mockResolvedValue({ data: [] })
    mockPost = vi.fn().mockResolvedValue({ data: {} })
    mockDelete = vi.fn().mockResolvedValue({ data: {} })
    ;(apiModule.default as any).mockReturnValue({ get: mockGet, post: mockPost, delete: mockDelete })
    ;(auth.getToken as any).mockReturnValue('test-token')
  })

  it('reads the token at call time, not at module initialization', async () => {
    ;(auth.getToken as any).mockReturnValue('token-after-login')
    await getSetores({})
    expect(mockGet).toHaveBeenCalledWith(
      expect.any(String),
      { headers: { 'x-access-token': 'token-after-login' } }
    )
  })

  describe('getSetores', () => {
    it('sends GET to resources/setores/ with auth header and query params', async () => {
      await getSetores({ page: 1, licensee: 'lic-id' })
      expect(mockGet).toHaveBeenCalledWith(
        'resources/setores/?page=1&licensee=lic-id',
        { headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('getSetor', () => {
    it('sends GET to resources/setores/:id with auth header', async () => {
      await getSetor('setor-id')
      expect(mockGet).toHaveBeenCalledWith(
        'resources/setores/setor-id',
        { headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('createSetor', () => {
    it('sends POST to resources/setores/ with auth header and body', async () => {
      const values = { name: 'Suporte', active: true }
      await createSetor(values)
      expect(mockPost).toHaveBeenCalledWith(
        'resources/setores/',
        { body: values, headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('updateSetor', () => {
    it('sends POST to resources/setores/:id with auth header and body', async () => {
      const setor = { id: 'setor-id', name: 'Suporte Updated' }
      await updateSetor(setor)
      expect(mockPost).toHaveBeenCalledWith(
        'resources/setores/setor-id',
        { headers: { 'x-access-token': 'test-token' }, body: setor }
      )
    })
  })

  describe('deleteSetor', () => {
    it('sends DELETE to resources/setores/:id with auth header', async () => {
      await deleteSetor('setor-id')
      expect(mockDelete).toHaveBeenCalledWith(
        'resources/setores/setor-id',
        { headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('getSetorBaileysStatus', () => {
    it('sends GET to resources/setores/:id/baileys-status', async () => {
      await getSetorBaileysStatus({ id: 'setor-id' })
      expect(mockGet).toHaveBeenCalledWith(
        'resources/setores/setor-id/baileys-status',
        { headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('getSetorBaileysQr', () => {
    it('sends POST to resources/setores/:id/baileys-qr', async () => {
      await getSetorBaileysQr({ id: 'setor-id' })
      expect(mockPost).toHaveBeenCalledWith(
        'resources/setores/setor-id/baileys-qr',
        { headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('syncSetorBaileys', () => {
    it('sends POST to resources/setores/:id/baileys-sync', async () => {
      await syncSetorBaileys({ id: 'setor-id' })
      expect(mockPost).toHaveBeenCalledWith(
        'resources/setores/setor-id/baileys-sync',
        { headers: { 'x-access-token': 'test-token' } }
      )
    })
  })
})
