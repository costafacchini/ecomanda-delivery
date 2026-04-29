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
  const controller = new AdressesController({
    contactRepository,
    normalizePhone: (number) => new NormalizePhone(number),
  })
  return { controller, contactRepository }
}

describe('AdressesController', () => {
  describe('update', () => {
    it('updates contact address and returns the updated contact with status 200', async () => {
      const { controller, contactRepository } = buildController()

      const contact = await contactRepository.create({
        number: '5511990283745',
        type: '@c.us',
        licensee: 'licensee-id',
        name: 'John Doe',
      })

      const req = {
        params: { number: '11990283745' },
        body: {
          address: 'Rua dois de outubro',
          address_number: '123',
          address_complement: 'rooms 1 and 2',
          neighborhood: 'Pedra branca',
          city: 'São Paulo',
          cep: '98543287',
          uf: 'SP',
          delivery_tax: 10.39,
          licensee: 'should-be-ignored',
        },
        licensee: { _id: 'licensee-id' },
      }
      const res = buildResponse()

      await controller.update(req, res)

      expect(res.status).toHaveBeenCalledWith(200)

      const updated = await contactRepository.findFirst({ _id: contact._id })
      expect(updated.address).toBe('Rua dois de outubro')
      expect(updated.address_number).toBe('123')
      expect(updated.delivery_tax).toBe(10.39)
      expect(updated.licensee).toBe('licensee-id') // not overwritten by body
    })

    it('returns 404 when contact is not found', async () => {
      const { controller } = buildController()

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

    it('returns 500 when an unexpected error occurs', async () => {
      const contactRepository = { findFirst: jest.fn().mockRejectedValue(new Error('db error')) }
      const controller = new AdressesController({
        contactRepository,
        normalizePhone: (number) => new NormalizePhone(number),
      })

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
