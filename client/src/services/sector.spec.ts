import * as auth from './auth'
import * as apiModule from './api'
import { getSectors, getSector, createSector, updateSector, deleteSector, getSectorBaileysStatus, getSectorBaileysQr, syncSectorBaileys } from './sector'

vi.mock('./auth')
vi.mock('./api')

describe('sector service', () => {
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
    await getSectors({})
    expect(mockGet).toHaveBeenCalledWith(
      expect.any(String),
      { headers: { 'x-access-token': 'token-after-login' } }
    )
  })

  describe('getSectors', () => {
    it('sends GET to resources/sectors/ with auth header and query params', async () => {
      await getSectors({ page: 1, licensee: 'lic-id' })
      expect(mockGet).toHaveBeenCalledWith(
        'resources/sectors/?page=1&licensee=lic-id',
        { headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('getSector', () => {
    it('sends GET to resources/sectors/:id with auth header', async () => {
      await getSector('sector-id')
      expect(mockGet).toHaveBeenCalledWith(
        'resources/sectors/sector-id',
        { headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('createSector', () => {
    it('sends POST to resources/sectors/ with auth header and body', async () => {
      const values = { name: 'Suporte', active: true }
      await createSector(values)
      expect(mockPost).toHaveBeenCalledWith(
        'resources/sectors/',
        { body: values, headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('updateSector', () => {
    it('sends POST to resources/sectors/:id with auth header and body', async () => {
      const sector = { id: 'sector-id', name: 'Suporte Updated' }
      await updateSector(sector)
      expect(mockPost).toHaveBeenCalledWith(
        'resources/sectors/sector-id',
        { headers: { 'x-access-token': 'test-token' }, body: sector }
      )
    })
  })

  describe('deleteSector', () => {
    it('sends DELETE to resources/sectors/:id with auth header', async () => {
      await deleteSector('sector-id')
      expect(mockDelete).toHaveBeenCalledWith(
        'resources/sectors/sector-id',
        { headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('getSectorBaileysStatus', () => {
    it('sends GET to resources/sectors/:id/baileys-status', async () => {
      await getSectorBaileysStatus({ id: 'sector-id' })
      expect(mockGet).toHaveBeenCalledWith(
        'resources/sectors/sector-id/baileys-status',
        { headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('getSectorBaileysQr', () => {
    it('sends POST to resources/sectors/:id/baileys-qr', async () => {
      await getSectorBaileysQr({ id: 'sector-id' })
      expect(mockPost).toHaveBeenCalledWith(
        'resources/sectors/sector-id/baileys-qr',
        { headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('syncSectorBaileys', () => {
    it('sends POST to resources/sectors/:id/baileys-sync', async () => {
      await syncSectorBaileys({ id: 'sector-id' })
      expect(mockPost).toHaveBeenCalledWith(
        'resources/sectors/sector-id/baileys-sync',
        { headers: { 'x-access-token': 'test-token' } }
      )
    })
  })
})
