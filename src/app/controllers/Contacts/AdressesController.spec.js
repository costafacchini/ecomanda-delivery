import { AdressesController } from './AdressesController.js'

function buildResponse() {
  return {
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  }
}

function buildController() {
  const contactRepository = {
    findFirst: jest.fn(),
    update: jest.fn(),
  }
  const normalizePhone = jest.fn()

  const controller = new AdressesController({ contactRepository, normalizePhone })

  return { controller, contactRepository, normalizePhone }
}

describe('AdressesController delegation', () => {
  describe('update', () => {
    it('updates contact address and returns status 200', async () => {
      const { controller, contactRepository, normalizePhone } = buildController()
      const normalizedPhone = { number: '5511990283745', type: '@c.us' }
      normalizePhone.mockReturnValue(normalizedPhone)

      const contact = { _id: 'contact-id', number: '5511990283745' }
      const updatedContact = {
        _id: 'contact-id',
        name: 'John Doe',
        number: '5511990283745',
        type: '@c.us',
        address: 'Rua dois de outubro',
        address_number: '123',
        address_complement: 'rooms 1 and 2',
        neighborhood: 'Pedra branca',
        city: 'São Paulo',
        cep: '98543287',
        uf: 'SP',
        delivery_tax: 10.39,
        licensee: 'licensee-id',
      }
      contactRepository.findFirst.mockResolvedValueOnce(contact).mockResolvedValueOnce(updatedContact)
      contactRepository.update.mockResolvedValue()

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

      expect(normalizePhone).toHaveBeenCalledWith('11990283745')
      expect(contactRepository.findFirst).toHaveBeenCalledWith({
        number: normalizedPhone.number,
        licensee: 'licensee-id',
        type: normalizedPhone.type,
      })
      expect(contactRepository.update).toHaveBeenCalledWith('contact-id', {
        address: 'Rua dois de outubro',
        address_number: '123',
        address_complement: 'rooms 1 and 2',
        neighborhood: 'Pedra branca',
        city: 'São Paulo',
        cep: '98543287',
        uf: 'SP',
        delivery_tax: 10.39,
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith(updatedContact)
    })

    it('returns 404 when contact is not found', async () => {
      const { controller, contactRepository, normalizePhone } = buildController()
      normalizePhone.mockReturnValue({ number: '5511111111', type: '@c.us' })
      contactRepository.findFirst.mockResolvedValue(null)

      const req = {
        params: { number: '1111111' },
        body: { address: 'Some street' },
        licensee: { _id: 'licensee-id' },
      }
      const res = buildResponse()

      await controller.update(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Contato 1111111 não encontrado' } })
    })

    it('returns 500 when an unexpected error occurs', async () => {
      const { controller, contactRepository, normalizePhone } = buildController()
      normalizePhone.mockReturnValue({ number: '5511990283745', type: '@c.us' })
      contactRepository.findFirst.mockRejectedValue(new Error('some error'))

      const req = {
        params: { number: '11990283745' },
        body: { address: 'Address modified' },
        licensee: { _id: 'licensee-id' },
      }
      const res = buildResponse()

      await controller.update(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Error: some error' } })
    })
  })

  describe('show', () => {
    it('returns contact address data and status 200', async () => {
      const { controller, contactRepository, normalizePhone } = buildController()
      const normalizedPhone = { number: '5511990283745', type: '@c.us' }
      normalizePhone.mockReturnValue(normalizedPhone)

      const contact = {
        _id: 'contact-id',
        name: 'John Doe',
        number: '5511990283745',
        type: '@c.us',
        address: 'Rua dois de outubro',
        licensee: { _id: 'licensee-id' },
      }
      contactRepository.findFirst.mockResolvedValue(contact)

      const req = {
        params: { number: '5511990283745' },
        licensee: { _id: 'licensee-id' },
      }
      const res = buildResponse()

      await controller.show(req, res)

      expect(contactRepository.findFirst).toHaveBeenCalledWith(
        { number: normalizedPhone.number, licensee: 'licensee-id', type: normalizedPhone.type },
        ['licensee'],
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith(contact)
    })

    it('returns 404 when contact is not found', async () => {
      const { controller, contactRepository, normalizePhone } = buildController()
      normalizePhone.mockReturnValue({ number: '5511111111', type: '@c.us' })
      contactRepository.findFirst.mockResolvedValue(null)

      const req = {
        params: { number: '111111' },
        licensee: { _id: 'licensee-id' },
      }
      const res = buildResponse()

      await controller.show(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Contato 111111 não encontrado' } })
    })

    it('returns 500 when an unexpected error occurs', async () => {
      const { controller, contactRepository, normalizePhone } = buildController()
      normalizePhone.mockReturnValue({ number: '5511990283745', type: '@c.us' })
      contactRepository.findFirst.mockRejectedValue(new Error('some error'))

      const req = {
        params: { number: '5511990283745' },
        licensee: { _id: 'licensee-id' },
      }
      const res = buildResponse()

      await controller.show(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Error: some error' } })
    })
  })
})
