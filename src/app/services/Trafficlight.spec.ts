describe('Trafficlight service', () => {
  let mockRepository
  let randomUUID
  let resolveTrafficlightKey
  let withTrafficlight

  beforeEach(() => {
    jest.resetModules()

    mockRepository = {
      create: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    }

    jest.doMock('crypto', () => ({
      randomUUID: jest.fn(() => 'trafficlight-token'),
    }))
    ;({ randomUUID } = require('crypto'))
    ;({ resolveTrafficlightKey, withTrafficlight } = require('./Trafficlight'))
  })

  afterEach(() => {
    jest.dontMock('crypto')
  })

  describe('#resolveTrafficlightKey', () => {
    it('returns the contact key when the payload has a contact id', () => {
      expect(resolveTrafficlightKey({ contactId: 'contact-123' })).toEqual('contact:contact-123')
    })

    it('returns the licensee key when the payload only has a licensee id', () => {
      expect(resolveTrafficlightKey({ body: { licenseeId: 'licensee-123' } })).toEqual('licensee:licensee-123')
    })

    it('returns null when the payload has no lockable identifiers', () => {
      expect(resolveTrafficlightKey({ body: {} })).toBeNull()
    })
  })

  describe('#withTrafficlight', () => {
    it('runs the handler without creating a lock when no key is provided', async () => {
      const handler = jest.fn().mockResolvedValue('handled')

      await expect(withTrafficlight(null, handler)).resolves.toEqual('handled')

      expect(handler).toHaveBeenCalledTimes(1)
      expect(mockRepository.create).not.toHaveBeenCalled()
      expect(mockRepository.delete).not.toHaveBeenCalled()
      expect(randomUUID).not.toHaveBeenCalled()
    })

    it('creates and releases a lock around the handler', async () => {
      const handler = jest.fn().mockResolvedValue('handled')

      await expect(
        withTrafficlight('contact:contact-123', handler, { trafficlightRepository: mockRepository }),
      ).resolves.toEqual('handled')

      expect(randomUUID).toHaveBeenCalledTimes(1)
      expect(mockRepository.create).toHaveBeenCalledWith({
        key: 'contact:contact-123',
        token: 'trafficlight-token',
        expiresAt: expect.any(Date),
      })
      expect(handler).toHaveBeenCalledTimes(1)
      expect(mockRepository.delete).toHaveBeenCalledWith({
        key: 'contact:contact-123',
        token: 'trafficlight-token',
      })
    })

    it('releases the lock even when the handler throws', async () => {
      const handler = jest.fn().mockRejectedValue(new Error('boom'))

      await expect(
        withTrafficlight('licensee:licensee-123', handler, { trafficlightRepository: mockRepository }),
      ).rejects.toThrow('boom')

      expect(mockRepository.create).toHaveBeenCalledTimes(1)
      expect(mockRepository.delete).toHaveBeenCalledWith({
        key: 'licensee:licensee-123',
        token: 'trafficlight-token',
      })
    })

    it('retries lock creation when the key is already locked', async () => {
      const handler = jest.fn().mockResolvedValue('handled')

      mockRepository.create.mockRejectedValueOnce({ code: 11000 }).mockResolvedValueOnce(undefined)

      await expect(
        withTrafficlight('contact:contact-123', handler, { trafficlightRepository: mockRepository }),
      ).resolves.toEqual('handled')

      expect(mockRepository.create).toHaveBeenCalledTimes(2)
      expect(handler).toHaveBeenCalledTimes(1)
      expect(mockRepository.delete).toHaveBeenCalledWith({
        key: 'contact:contact-123',
        token: 'trafficlight-token',
      })
    })
  })
})
