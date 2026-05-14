import { ContactRepositoryMemory } from '@repositories/contact'
import { ContactsController } from './ContactsController.js'

function buildResponse() {
  return {
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  }
}

async function runValidations(controller, req) {
  const validations = controller.validations()

  for (const validation of validations) {
    await validation.run(req)
  }
}

function buildController() {
  const contactRepository = new ContactRepositoryMemory()
  const contactsQueryInstance = {
    page: jest.fn(),
    limit: jest.fn(),
    filterByType: jest.fn(),
    filterByTalkingWithChatbot: jest.fn(),
    filterByLicensee: jest.fn(),
    filterByExpression: jest.fn(),
    all: jest.fn(),
  }
  const createContactsQuery = jest.fn().mockReturnValue(contactsQueryInstance)
  const createContact = {
    execute: jest.fn(),
  }
  const updateContact = {
    execute: jest.fn(),
  }

  const controller = new ContactsController({
    contactRepository,
    createContactsQuery,
    createContact,
    updateContact,
  })

  return {
    controller,
    contactRepository,
    createContactsQuery,
    contactsQueryInstance,
    createContact,
    updateContact,
  }
}

describe('ContactsController delegation', () => {
  it('delegates create to the createContact use case and returns status 201', async () => {
    const { controller, createContact } = buildController()
    const req = {
      body: {
        name: 'John Doe',
        number: '5511990283745',
        type: '@c.us',
        talkingWithChatBot: false,
        licensee: 'licensee-id',
      },
    }
    const res = buildResponse()
    const contact = { _id: 'contact-id', name: 'John Doe' }

    createContact.execute.mockResolvedValue(contact)

    await controller.create(req, res)

    expect(createContact.execute).toHaveBeenCalledWith(req.body)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.send).toHaveBeenCalledWith(contact)
  })

  it('returns status 422 when create validation fails before delegating to the use case', async () => {
    const { controller, createContact } = buildController()
    const req = {
      body: {
        email: 'john-doe.com',
      },
    }
    const res = buildResponse()

    await runValidations(controller, req)
    await controller.create(req, res)

    expect(createContact.execute).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.send).toHaveBeenCalledWith({
      errors: [{ message: 'Email deve ser preenchido com um valor válido' }],
    })
  })

  it('returns status 422 when createContact raises model validation errors', async () => {
    const { controller, createContact } = buildController()
    const req = {
      body: {
        type: '@c.us',
      },
    }
    const res = buildResponse()

    createContact.execute.mockRejectedValue({
      errors: {
        number: { message: 'Numero: Você deve preencher o campo' },
        talkingWithChatBot: { message: 'Talking with chatbot: Você deve preencher o campo' },
        licensee: { message: 'Licensee: Você deve preencher o campo' },
      },
    })

    await controller.create(req, res)

    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.send).toHaveBeenCalledWith({
      errors: [
        { message: 'Numero: Você deve preencher o campo' },
        { message: 'Talking with chatbot: Você deve preencher o campo' },
        { message: 'Licensee: Você deve preencher o campo' },
      ],
    })
  })

  it('returns status 500 when createContact throws an unexpected error', async () => {
    const { controller, createContact } = buildController()
    const req = {
      body: {
        name: 'John Doe',
        number: '5511990283745',
      },
    }
    const res = buildResponse()

    createContact.execute.mockRejectedValue(new Error('some error'))

    await controller.create(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.send).toHaveBeenCalledWith({
      errors: { message: 'Erro interno do servidor.' },
    })
  })

  it('delegates update to the updateContact use case and returns status 200', async () => {
    const { controller, updateContact } = buildController()
    const req = {
      params: { id: 'contact-id' },
      body: {
        name: 'John Silva',
        number: '55998465654',
        type: '@g.us',
        talkingWithChatBot: true,
        licensee: 'licensee-id',
      },
    }
    const res = buildResponse()
    const contact = { _id: 'contact-id', name: 'John Silva' }

    updateContact.execute.mockResolvedValue(contact)

    await controller.update(req, res)

    expect(updateContact.execute).toHaveBeenCalledWith('contact-id', req.body)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith(contact)
  })

  it('returns status 422 when updateContact raises model validation errors', async () => {
    const { controller, updateContact } = buildController()
    const req = {
      params: { id: 'contact-id' },
      body: { number: '' },
    }
    const res = buildResponse()

    updateContact.execute.mockRejectedValue({
      errors: {
        number: { message: 'Numero: Você deve preencher o campo' },
      },
    })

    await controller.update(req, res)

    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.send).toHaveBeenCalledWith({
      errors: [{ message: 'Numero: Você deve preencher o campo' }],
    })
  })

  it('returns status 500 when updateContact throws an unexpected error', async () => {
    const { controller, updateContact } = buildController()
    const req = {
      params: { id: 'contact-id' },
      body: { name: 'Name modified' },
    }
    const res = buildResponse()

    updateContact.execute.mockRejectedValue(new Error('some error'))

    await controller.update(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.send).toHaveBeenCalledWith({
      errors: { message: 'Erro interno do servidor.' },
    })
  })

  it('delegates show to contactRepository.findFirst and returns status 200', async () => {
    const { controller, contactRepository } = buildController()
    const seeded = await contactRepository.create({ name: 'John Doe', number: '5511990283745' })

    const req = { params: { id: seeded._id } }
    const res = buildResponse()

    await controller.show(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ _id: seeded._id, name: 'John Doe' }))
  })

  it('returns 404 from show when id cast fails', async () => {
    const contactRepository = {
      findFirst: jest.fn().mockRejectedValue(Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError', kind: 'ObjectId' })),
    }
    const createContactsQuery = jest.fn()
    const createContact = { execute: jest.fn() }
    const updateContact = { execute: jest.fn() }
    const controller = new ContactsController({ contactRepository, createContactsQuery, createContact, updateContact })

    const req = { params: { id: 'bad' } }
    const res = buildResponse()

    await controller.show(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Contato bad não encontrado' } })
  })

  it('delegates index to contactsQuery and returns status 200', async () => {
    const { controller, contactsQueryInstance } = buildController()
    const contacts = [{ _id: 'contact-id' }]
    contactsQueryInstance.all.mockResolvedValue(contacts)

    const req = { query: { page: '1', limit: '3', expression: 'Doe' } }
    const res = buildResponse()

    await controller.index(req, res)

    expect(contactsQueryInstance.page).toHaveBeenCalledWith('1')
    expect(contactsQueryInstance.limit).toHaveBeenCalledWith('3')
    expect(contactsQueryInstance.filterByExpression).toHaveBeenCalledWith('Doe')
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith(contacts)
  })
})
