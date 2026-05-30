import * as auth from './auth'
import * as apiModule from './api'
import {
  createLicensee,
  getLicensees,
  getLicensee,
  updateLicensee,
  setLicenseeWebhook,
  getBaileysQr,
  getBaileysStatus,
  importLicenseeTemplate,
  sendLicenseePagarMe,
  signOrderWebhook,
  syncBaileysDirectory,
} from './licensee'

vi.mock('./auth')
vi.mock('./api')

describe('licensee service', () => {
  let mockGet, mockPost
  const licensee = { id: 'lic-id', name: 'Acme' }

  beforeEach(() => {
    mockGet = vi.fn().mockResolvedValue({ data: {} })
    mockPost = vi.fn().mockResolvedValue({ data: {} })
    apiModule.default.mockReturnValue({ get: mockGet, post: mockPost })
    auth.getToken.mockReturnValue('test-token')
  })

  it('reads the token at call time, not at module initialization', async () => {
    auth.getToken.mockReturnValue('token-after-login')
    await getLicensees({})
    expect(mockGet).toHaveBeenCalledWith(
      expect.any(String),
      { headers: { 'x-access-token': 'token-after-login' } }
    )
  })

  describe('getLicensees', () => {
    it('sends GET to resources/licensees/ with auth header and query params', async () => {
      await getLicensees({ page: 1 })
      expect(mockGet).toHaveBeenCalledWith(
        'resources/licensees/?page=1',
        { headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('getLicensee', () => {
    it('sends GET to resources/licensees/:id with auth header', async () => {
      await getLicensee('lic-id')
      expect(mockGet).toHaveBeenCalledWith(
        'resources/licensees/lic-id',
        { headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('createLicensee', () => {
    it('sends POST to resources/licensees/ with auth header and body', async () => {
      const values = { name: 'New Licensee' }
      await createLicensee(values)
      expect(mockPost).toHaveBeenCalledWith(
        'resources/licensees/',
        { body: values, headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('updateLicensee', () => {
    it('sends POST to resources/licensees/:id with auth header and body', async () => {
      await updateLicensee(licensee)
      expect(mockPost).toHaveBeenCalledWith(
        'resources/licensees/lic-id',
        { headers: { 'x-access-token': 'test-token' }, body: licensee }
      )
    })
  })

  describe('setLicenseeWebhook', () => {
    it('sends POST to resources/licensees/:id/dialogwebhook with auth header and body', async () => {
      await setLicenseeWebhook(licensee)
      expect(mockPost).toHaveBeenCalledWith(
        'resources/licensees/lic-id/dialogwebhook',
        { headers: { 'x-access-token': 'test-token' }, body: licensee }
      )
    })
  })

  describe('getBaileysQr', () => {
    it('sends POST to resources/licensees/:id/baileys-qr with auth header', async () => {
      await getBaileysQr(licensee)
      expect(mockPost).toHaveBeenCalledWith(
        'resources/licensees/lic-id/baileys-qr',
        { headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('getBaileysStatus', () => {
    it('sends GET to resources/licensees/:id/baileys-status with auth header', async () => {
      await getBaileysStatus(licensee)
      expect(mockGet).toHaveBeenCalledWith(
        'resources/licensees/lic-id/baileys-status',
        { headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('sendLicenseePagarMe', () => {
    it('sends POST to resources/licensees/:id/integration/pagarme with auth header and body', async () => {
      await sendLicenseePagarMe(licensee)
      expect(mockPost).toHaveBeenCalledWith(
        'resources/licensees/lic-id/integration/pagarme',
        { headers: { 'x-access-token': 'test-token' }, body: licensee }
      )
    })
  })

  describe('importLicenseeTemplate', () => {
    it('sends POST to resources/templates/:id/importation/ with auth header', async () => {
      await importLicenseeTemplate(licensee)
      expect(mockPost).toHaveBeenCalledWith(
        'resources/templates/lic-id/importation/',
        { headers: { 'x-access-token': 'test-token' } }
      )
    })
  })

  describe('signOrderWebhook', () => {
    it('sends POST to resources/licensees/:id/sign-order-webhook with auth header and body', async () => {
      await signOrderWebhook(licensee)
      expect(mockPost).toHaveBeenCalledWith(
        'resources/licensees/lic-id/sign-order-webhook',
        { headers: { 'x-access-token': 'test-token' }, body: licensee }
      )
    })
  })

  describe('syncBaileysDirectory', () => {
    it('sends POST to resources/licensees/:id/baileys-sync with auth header', async () => {
      await syncBaileysDirectory(licensee)
      expect(mockPost).toHaveBeenCalledWith(
        'resources/licensees/lic-id/baileys-sync',
        { headers: { 'x-access-token': 'test-token' } }
      )
    })
  })
})
