import { ContactRepositoryMemory } from '@repositories/contact'
import { NormalizePhone } from '../../helpers/NormalizePhone.js'
import { AdressesController } from './AdressesController.js'

function buildResponse() {
  return {
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  }
}

function buildController() {
  const contactRepository = new ContactRepositoryMemory()
  const updateContactAddress = { execute: jest.fn() }
  const controller = new AdressesController({
    contactRepository,
    normalizePhone: (number) => new NormalizePhone(number),
    updateContactAddress,
  })
  return { controller, contactRepository, updateContactAddress }
}

describe('AdressesController', () => {
  describe('update', () => {
    it('delegates to updateContactAddress and returns the updated contact with status 200', async () => {
      const { controller, updateContactAddress } = buildController()
      const contact = { _id: 'contact-id', address: 'Rua dois de outubro' }
      updateContactAddress.execute.mockResolvedValue(contact)

      const req = {
        params: { number: '11990283745' },
        body: { address: 'Rua dois de outubro', licensee: 'should-be-ignored' },
        licensee: { _id: 'licensee-id' },
      }
      const res = buildResponse()

      await controller.update(req, res)

      expect(updateContactAddress.execute).toHaveBeenCalledWith({
        number: '11990283745',
        licenseeId: 'licensee-id',
        fields: req.body,
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith(contact)
    })

    it('returns 404 when updateContactAddress returns null', async () => {
      const { controller, updateContactAddress } = buildController()
      updateContactAddress.execute.mockResolvedValue(null)

      const req = {
        params: { number: '11111111111' },
        body: { address: 'Some street' },
        licensee: { _id: 'licensee-id' },
      }
      const res = buildResponse()

      await controller.update(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Contato 11111111111 não encontrado' } })
    })

    it('returns 500 when updateContactAddress throws an unexpected error', async () => {
      const { controller, updateContactAddress } = buildController()
      updateContactAddress.execute.mockRejectedValue(new Error('db error'))

      const req = {
        params: { number: '11990283745' },
        body: { address: 'Anything' },
        licensee: { _id: 'licensee-id' },
      }
      const res = buildResponse()

      await controller.update(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Error: db error' } })
    })
  })

  describe('show', () => {
    it('returns contact address data with status 200', async () => {
      const { controller, contactRepository } = buildController()

      const contact = await contactRepository.create({
        number: '5511990283745',
        type: '@c.us',
        licensee: 'licensee-id',
        address: 'Rua dois de outubro',
      })

      const req = {
        params: { number: '11990283745' },
        licensee: { _id: 'licensee-id' },
      }
      const res = buildResponse()

      await controller.show(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ _id: contact._id, address: 'Rua dois de outubro' }),
      )
    })

    it('returns 404 when contact is not found', async () => {
      const { controller } = buildController()

      const req = {
        params: { number: '11111111111' },
        licensee: { _id: 'licensee-id' },
      }
      const res = buildResponse()

      await controller.show(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Contato 11111111111 não encontrado' } })
    })

    it('returns 500 when an unexpected error occurs', async () => {
      const contactRepository = { findFirst: jest.fn().mockRejectedValue(new Error('db error')) }
      const controller = new AdressesController({
        contactRepository,
        normalizePhone: (number) => new NormalizePhone(number),
        updateContactAddress: { execute: jest.fn() },
      })

      const req = {
        params: { number: '11990283745' },
        licensee: { _id: 'licensee-id' },
      }
      const res = buildResponse()

      await controller.show(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Error: db error' } })
    })
  })
})
