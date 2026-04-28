import User from '@models/User'
import request from 'supertest'
import { installMemoryRepositories, resetMemoryRepositories } from '@repositories/testing'
import { expressServer } from '../../../.jest/server-express'
import { licenseeComplete as licenseeCompleteFactory, licensee as licenseeFactory } from '@factories/licensee'
import { userSuper as userSuperFactory } from '@factories/user'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { LicenseesQuery } from '@queries/LicenseesQuery'
import { Recipient } from '@plugins/payments/PagarMe/Recipient'
import { Pedidos10 } from '@plugins/integrations/Pedidos10'
import { LicenseesController } from './LicenseesController.js'
import { WEBHOOK_CONFIGURED_MESSAGE } from '../usecases/licensees/SetDialogWebhook.js'
import { LICENSEE_SENT_TO_PAGARME_MESSAGE } from '../usecases/licensees/SendLicenseeToPagarMe.js'
import { WEBHOOK_NOT_SIGNED_MESSAGE, WEBHOOK_SIGNED_MESSAGE } from '../usecases/licensees/SignPedidos10OrderWebhook.js'

function buildResponse() {
  return {
    json: jest.fn(),
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
  const licenseeRepository = {
    findFirst: jest.fn(),
  }
  const createLicenseesQuery = jest.fn()
  const createLicensee = {
    execute: jest.fn(),
  }
  const updateLicensee = {
    execute: jest.fn(),
  }
  const setDialogWebhook = {
    execute: jest.fn(),
  }
  const sendLicenseeToPagarMe = {
    execute: jest.fn(),
  }
  const signPedidos10OrderWebhook = {
    execute: jest.fn(),
  }

  const controller = new LicenseesController({
    licenseeRepository,
    createLicenseesQuery,
    createLicensee,
    updateLicensee,
    setDialogWebhook,
    sendLicenseeToPagarMe,
    signPedidos10OrderWebhook,
  })

  return {
    controller,
    licenseeRepository,
    createLicenseesQuery,
    createLicensee,
    updateLicensee,
    setDialogWebhook,
    sendLicenseeToPagarMe,
    signPedidos10OrderWebhook,
  }
}

describe('LicenseesController delegation', () => {
  it('delegates create to the createLicensee use case and returns status 201', async () => {
    const { controller, createLicensee } = buildController()
    const req = {
      body: {
        name: 'Alcateia Ltds',
        email: 'alcateia@alcateia.com',
        pedidos10_integration: JSON.stringify({ username: 'alcateia' }),
      },
    }
    const res = buildResponse()
    const licensee = { _id: 'licensee-id', name: 'Alcateia Ltds' }

    createLicensee.execute.mockResolvedValue(licensee)

    await controller.create(req, res)

    expect(createLicensee.execute).toHaveBeenCalledWith(req.body)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.send).toHaveBeenCalledWith(licensee)
  })

  it('returns status 422 when create validation fails before delegating to the use case', async () => {
    const { controller, createLicensee } = buildController()
    const req = {
      body: { email: 'emailinvalid.com' },
    }
    const res = buildResponse()

    await runValidations(controller, req)
    await controller.create(req, res)

    expect(createLicensee.execute).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.json).toHaveBeenCalledWith({
      errors: [{ message: 'Email deve ser preenchido com um valor válido' }],
    })
  })

  it('returns status 422 when createLicensee raises model validation errors', async () => {
    const { controller, createLicensee } = buildController()
    const req = {
      body: { name: '', email: 'alcateia@alcateia.com' },
    }
    const res = buildResponse()

    createLicensee.execute.mockRejectedValue({
      errors: {
        name: { message: 'Nome: Você deve preencher o campo' },
      },
    })

    await controller.create(req, res)

    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.json).toHaveBeenCalledWith({
      errors: [{ message: 'Nome: Você deve preencher o campo' }],
    })
  })

  it('returns status 500 when createLicensee throws an unexpected error', async () => {
    const { controller, createLicensee } = buildController()
    const req = {
      body: { name: 'Alcateia Ltds', email: 'alcateia@alcateia.com' },
    }
    const res = buildResponse()

    createLicensee.execute.mockRejectedValue(new Error('some error'))

    await controller.create(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.send).toHaveBeenCalledWith({
      errors: { message: 'Error: some error' },
    })
  })

  it('delegates update to the updateLicensee use case and returns status 200', async () => {
    const { controller, updateLicensee } = buildController()
    const req = {
      params: { id: 'licensee-id' },
      body: {
        name: 'Name modified',
        email: 'modified@alcateia.com',
        pedidos10_integration: JSON.stringify({ username: 'modified' }),
      },
    }
    const res = buildResponse()
    const licensee = { _id: 'licensee-id', name: 'Name modified' }

    updateLicensee.execute.mockResolvedValue(licensee)

    await controller.update(req, res)

    expect(updateLicensee.execute).toHaveBeenCalledWith('licensee-id', req.body)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith(licensee)
  })

  it('returns status 422 when update validation fails before delegating to the use case', async () => {
    const { controller, updateLicensee } = buildController()
    const req = {
      params: { id: 'licensee-id' },
      body: { email: 'modifiedalcateia.com' },
    }
    const res = buildResponse()

    await runValidations(controller, req)
    await controller.update(req, res)

    expect(updateLicensee.execute).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.json).toHaveBeenCalledWith({
      errors: [{ message: 'Email deve ser preenchido com um valor válido' }],
    })
  })

  it('returns status 422 when updateLicensee raises model validation errors', async () => {
    const { controller, updateLicensee } = buildController()
    const req = {
      params: { id: 'licensee-id' },
      body: { name: '' },
    }
    const res = buildResponse()

    updateLicensee.execute.mockRejectedValue({
      errors: {
        name: { message: 'Nome: Você deve preencher o campo' },
      },
    })

    await controller.update(req, res)

    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.json).toHaveBeenCalledWith({
      errors: [{ message: 'Nome: Você deve preencher o campo' }],
    })
  })

  it('returns status 500 when updateLicensee throws an unexpected error', async () => {
    const { controller, updateLicensee } = buildController()
    const req = {
      params: { id: 'licensee-id' },
      body: { name: 'Name modified' },
    }
    const res = buildResponse()

    updateLicensee.execute.mockRejectedValue(new Error('some error'))

    await controller.update(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.send).toHaveBeenCalledWith({
      errors: { message: 'Error: some error' },
    })
  })

  it('delegates setDialogWebhook to the use case and returns status 200', async () => {
    const { controller, setDialogWebhook } = buildController()
    const req = {
      params: { id: 'licensee-id' },
    }
    const res = buildResponse()

    setDialogWebhook.execute.mockResolvedValue({ message: WEBHOOK_CONFIGURED_MESSAGE })

    await controller.setDialogWebhook(req, res)

    expect(setDialogWebhook.execute).toHaveBeenCalledWith('licensee-id')
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith({ message: WEBHOOK_CONFIGURED_MESSAGE })
  })

  it('delegates sendToPagarMe to the use case and returns status 200', async () => {
    const { controller, sendLicenseeToPagarMe } = buildController()
    const req = {
      params: { id: 'licensee-id' },
    }
    const res = buildResponse()

    sendLicenseeToPagarMe.execute.mockResolvedValue({
      message: LICENSEE_SENT_TO_PAGARME_MESSAGE,
    })

    await controller.sendToPagarMe(req, res)

    expect(sendLicenseeToPagarMe.execute).toHaveBeenCalledWith('licensee-id')
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith({
      message: LICENSEE_SENT_TO_PAGARME_MESSAGE,
    })
  })

  it('delegates signOrderWebhook to the use case and returns status 200', async () => {
    const { controller, signPedidos10OrderWebhook } = buildController()
    const req = {
      params: { id: 'licensee-id' },
    }
    const res = buildResponse()

    signPedidos10OrderWebhook.execute.mockResolvedValue({ message: WEBHOOK_SIGNED_MESSAGE })

    await controller.signOrderWebhook(req, res)

    expect(signPedidos10OrderWebhook.execute).toHaveBeenCalledWith('licensee-id')
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith({ message: WEBHOOK_SIGNED_MESSAGE })
  })

  it('returns the unsigned webhook message from the signOrderWebhook use case', async () => {
    const { controller, signPedidos10OrderWebhook } = buildController()
    const req = {
      params: { id: 'licensee-id' },
    }
    const res = buildResponse()

    signPedidos10OrderWebhook.execute.mockResolvedValue({
      message: WEBHOOK_NOT_SIGNED_MESSAGE,
    })

    await controller.signOrderWebhook(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith({
      message: WEBHOOK_NOT_SIGNED_MESSAGE,
    })
  })

  it('returns status 500 when an external-action use case throws an unexpected error', async () => {
    const { controller, setDialogWebhook } = buildController()
    const req = {
      params: { id: 'licensee-id' },
    }
    const res = buildResponse()

    setDialogWebhook.execute.mockRejectedValue(new Error('some error'))

    await controller.setDialogWebhook(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.send).toHaveBeenCalledWith({
      errors: { message: 'Error: some error' },
    })
  })
})

describe('licensee controller', () => {
  let token

  beforeAll(async () => {
    installMemoryRepositories()

    await User.create(userSuperFactory.build())

    await request(expressServer)
      .post('/login')
      .send({ email: 'john@doe.com', password: '12345678' })
      .then((response) => {
        token = response.body.token
      })
  })

  afterAll(() => {
    resetMemoryRepositories()
  })

  describe('about auth', () => {
    it('returns status 401 and message if x-access-token in not inform in header', async () => {
      await request(expressServer)
        .post('/resources/licensees/')
        .send(licenseeCompleteFactory.build())
        .expect('Content-Type', /json/)
        .expect(401, {
          auth: false,
          message: 'Token não informado.',
        })
    })

    it('returns status 500 and message if x-access-token is invalid', async () => {
      await request(expressServer)
        .post('/resources/licensees/')
        .set('x-access-token', 'invalid')
        .send(
          licenseeCompleteFactory.build({
            name: 'Mary Jane',
            email: 'mary@jane.com',
            password: '12345678',
            active: true,
          }),
        )
        .expect('Content-Type', /json/)
        .expect(500, {
          auth: false,
          message: 'Falha na autenticação com token.',
        })
    })
  })

  describe('create', () => {
    describe('response', () => {
      it('returns status 201 and the licensee data if the create is successful', async () => {
        await request(expressServer)
          .post('/resources/licensees/')
          .set('x-access-token', token)
          .send(licenseeCompleteFactory.build({ whatsappDefault: 'utalk', whatsappUrl: 'https://v1.utalk.chat/send/' }))
          .expect('Content-Type', /json/)
          .expect(201)
          .then((response) => {
            expect(response.body.name).toEqual('Alcateia Ltds')
            expect(response.body.email).toEqual('alcateia@alcateia.com')
            expect(response.body.phone).toEqual('11098538273')
            expect(response.body.active).toEqual(true)
            expect(response.body.licenseKind).toEqual('demo')
            expect(response.body.useChatbot).toEqual(true)
            expect(response.body.chatbotDefault).toEqual('landbot')
            expect(response.body.whatsappDefault).toEqual('utalk')
            expect(response.body.chatDefault).toEqual('rocketchat')
            expect(response.body.chatbotUrl).toEqual('https://chatbot.url')
            expect(response.body.chatbotAuthorizationToken).toEqual('chat-bot-token')
            expect(response.body.whatsappToken).toEqual('whatsapp-token')
            expect(response.body.whatsappUrl).toEqual('https://v1.utalk.chat/send/')
            expect(response.body.chatUrl).toEqual('https://chat.url')
            expect(response.body.awsId).toEqual('aws-id')
            expect(response.body.awsSecret).toEqual('aws-secret')
            expect(response.body.bucketName).toEqual('bocket-name')
            expect(response.body._id).toBeDefined()
            expect(response.body._id).not.toBe('')
            expect(response.body._id).not.toBe(null)
          })
      })

      it('returns status 422 and message if the licensee is not valid', async () => {
        await request(expressServer)
          .post('/resources/licensees/')
          .set('x-access-token', token)
          .send(licenseeCompleteFactory.build({ name: '', licenseKind: '' }))
          .expect('Content-Type', /json/)
          .expect(422, {
            errors: [
              { message: 'Nome: Você deve preencher o campo' },
              { message: 'Tipo de Licença: Você deve informar um valor ( demo | free | paid)' },
            ],
          })
      })

      it('returns status 500 and message if the some error ocurred when create the licensee', async () => {
        const licenseeSaveSpy = jest.spyOn(LicenseeRepositoryDatabase.prototype, 'create').mockImplementation(() => {
          throw new Error('some error')
        })

        await request(expressServer)
          .post('/resources/licensees/')
          .set('x-access-token', token)
          .send(licenseeFactory.build())
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        licenseeSaveSpy.mockRestore()
      })

      describe('validations', () => {
        it('returns status 422 and message if the email is invalid', async () => {
          await request(expressServer)
            .post('/resources/licensees/')
            .set('x-access-token', token)
            .send(licenseeFactory.build({ email: 'emailinvalid.com' }))
            .expect('Content-Type', /json/)
            .expect(422, {
              errors: [{ message: 'Email deve ser preenchido com um valor válido' }],
            })
        })
      })
    })
  })

  describe('update', () => {
    describe('response', () => {
      it('returns status 200 and the licensee data if the update is successful', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeCompleteFactory.build())

        await request(expressServer)
          .post(`/resources/licensees/${licensee._id}`)
          .set('x-access-token', token)
          .send({
            _id: 123,
            name: 'Name modified',
            email: 'modified@alcateia.com',
            phone: '110985387875',
            active: false,
            licenseKind: 'paid',
            useChatbot: false,
            chatbotDefault: '',
            whatsappDefault: '',
            chatDefault: '',
            chatbotUrl: '',
            chatbotAuthorizationToken: '',
            whatsappToken: '',
            whatsappUrl: '',
            chatUrl: '',
            awsId: '',
            awsSecret: '',
            bucketName: '',
          })
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body._id).not.toEqual(123)
            expect(response.body.name).toEqual('Name modified')
            expect(response.body.email).toEqual('modified@alcateia.com')
            expect(response.body.phone).toEqual('110985387875')
            expect(response.body.active).toEqual(false)
            expect(response.body.licenseKind).toEqual('paid')
            expect(response.body.useChatbot).toEqual(false)
            expect(response.body.chatbotDefault).toEqual('')
            expect(response.body.whatsappDefault).toEqual('')
            expect(response.body.chatDefault).toEqual('')
            expect(response.body.chatbotUrl).toEqual('')
            expect(response.body.chatbotAuthorizationToken).toEqual('')
            expect(response.body.whatsappToken).toEqual('')
            expect(response.body.whatsappUrl).toEqual('')
            expect(response.body.chatUrl).toEqual('')
            expect(response.body.awsId).toEqual('')
            expect(response.body.awsSecret).toEqual('')
            expect(response.body.bucketName).toEqual('')
          })
      })

      it('returns status 422 and message if the licensee is not valid', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeFactory.build())

        await request(expressServer)
          .post(`/resources/licensees/${licensee._id}`)
          .set('x-access-token', token)
          .send({ name: '', licenseKind: '' })
          .expect('Content-Type', /json/)
          .expect(422, {
            errors: [
              { message: 'Nome: Você deve preencher o campo' },
              { message: 'Tipo de Licença: Você deve informar um valor ( demo | free | paid)' },
            ],
          })
      })

      it('returns status 500 and message if the some error ocurre when update the licensee', async () => {
        const licenseeFindOneSpy = jest
          .spyOn(LicenseeRepositoryDatabase.prototype, 'findFirst')
          .mockImplementation(() => {
            throw new Error('some error')
          })

        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeFactory.build())

        await request(expressServer)
          .post(`/resources/licensees/${licensee._id}`)
          .set('x-access-token', token)
          .send({ name: 'Name modified', email: 'modified@alcateia.com', phone: '110985387875' })
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        licenseeFindOneSpy.mockRestore()
      })

      describe('validations', () => {
        it('returns status 422 and message if the email is invalid', async () => {
          const licenseeRepository = new LicenseeRepositoryDatabase()
          const licensee = await licenseeRepository.create(licenseeFactory.build())

          await request(expressServer)
            .post(`/resources/licensees/${licensee._id}`)
            .set('x-access-token', token)
            .send({ email: 'modifiedalcateia.com' })
            .expect('Content-Type', /json/)
            .expect(422, {
              errors: [{ message: 'Email deve ser preenchido com um valor válido' }],
            })
        })
      })
    })
  })

  describe('show', () => {
    describe('response', () => {
      it('returns status 200 and message if licensee exists', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeCompleteFactory.build())

        await request(expressServer)
          .get(`/resources/licensees/${licensee._id}`)
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.name).toEqual('Alcateia Ltds')
            expect(response.body.email).toEqual('alcateia@alcateia.com')
            expect(response.body.phone).toEqual('11098538273')
            expect(response.body.active).toEqual(true)
            expect(response.body.licenseKind).toEqual('demo')
            expect(response.body.useChatbot).toEqual(true)
            expect(response.body.chatbotDefault).toEqual('landbot')
            expect(response.body.whatsappDefault).toEqual('dialog')
            expect(response.body.chatDefault).toEqual('rocketchat')
            expect(response.body.chatbotUrl).toEqual('https://chatbot.url')
            expect(response.body.chatbotAuthorizationToken).toEqual('chat-bot-token')
            expect(response.body.whatsappToken).toEqual('whatsapp-token')
            expect(response.body.whatsappUrl).toEqual('https://waba.360dialog.io/')
            expect(response.body.chatUrl).toEqual('https://chat.url')
            expect(response.body.awsId).toEqual('aws-id')
            expect(response.body.awsSecret).toEqual('aws-secret')
            expect(response.body.bucketName).toEqual('bocket-name')
            expect(response.body._id).toMatch(licensee._id.toString())
          })
      })

      it('returns status 404 and message if licensee does not exists', async () => {
        await request(expressServer)
          .get('/resources/licensees/12312')
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(404, {
            errors: { message: 'Licenciado 12312 não encontrado' },
          })
      })

      it('returns status 500 and message if occurs another error', async () => {
        const licenseeFindOneSpy = jest
          .spyOn(LicenseeRepositoryDatabase.prototype, 'findFirst')
          .mockImplementation(() => {
            throw new Error('some error')
          })

        await request(expressServer)
          .get('/resources/licensees/12312')
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        licenseeFindOneSpy.mockRestore()
      })
    })
  })

  describe('index', () => {
    describe('response', () => {
      it('returns status 200 and message if licensee exists', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()
        await licenseeRepository.create(
          licenseeCompleteFactory.build({
            chatDefault: 'rocketchat',
            chatbotDefault: 'landbot',
            whatsappDefault: 'utalk',
            name: 'Alcalina',
          }),
        )
        await licenseeRepository.create(
          licenseeCompleteFactory.build({
            chatDefault: 'rocketchat',
            chatbotDefault: 'landbot',
            whatsappDefault: 'utalk',
            name: 'Alcateia ltds',
          }),
        )
        await licenseeRepository.create(
          licenseeCompleteFactory.build({
            chatDefault: 'rocketchat',
            chatbotDefault: 'landbot',
            whatsappDefault: 'utalk',
            name: 'Alcachofra',
          }),
        )
        await licenseeRepository.create(
          licenseeCompleteFactory.build({
            active: false,
            chatDefault: 'rocketchat',
            chatbotDefault: 'landbot',
            whatsappDefault: 'utalk',
            name: 'Alcachofra',
          }),
        )

        await request(expressServer)
          .get(
            '/resources/licensees/?chatDefault=rocketchat&chatbotDefault=landbot&whatsappDefault=utalk&expression=Alca&page=1&limit=3&active=false',
          )
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(Array.isArray(response.body)).toEqual(true)
            expect(response.body.length).toEqual(3)
            expect(response.body[0].name).toEqual('Alcateia Ltds')
            expect(response.body[1].email).toEqual('alcateia@alcateia.com')
            expect(response.body[1].phone).toEqual('11098538273')
            expect(response.body[1].active).toEqual(true)
            expect(response.body[1].licenseKind).toEqual('demo')
            expect(response.body[1].useChatbot).toEqual(true)
            expect(response.body[1].chatbotDefault).toEqual('landbot')
            expect(response.body[1].whatsappDefault).toEqual('utalk')
            expect(response.body[1].chatDefault).toEqual('rocketchat')
            expect(response.body[1].chatbotUrl).toEqual('https://chatbot.url')
            expect(response.body[1].chatbotAuthorizationToken).toEqual('chat-bot-token')
            expect(response.body[1].whatsappToken).toEqual('whatsapp-token')
            expect(response.body[1].whatsappUrl).toEqual('https://v1.utalk.chat/send/')
            expect(response.body[1].chatUrl).toEqual('https://chat.url')
            expect(response.body[1].awsId).toEqual('aws-id')
            expect(response.body[1].awsSecret).toEqual('aws-secret')
            expect(response.body[1].bucketName).toEqual('bocket-name')
            expect(response.body[1]._id).toBeDefined()
            expect(response.body[1]._id).not.toBe('')
            expect(response.body[1]._id).not.toBe(null)
          })
      })

      it('returns status 500 and message if occurs another error', async () => {
        const licenseeFindSpy = jest.spyOn(LicenseesQuery.prototype, 'all').mockImplementation(() => {
          throw new Error('some error')
        })

        await request(expressServer)
          .get('/resources/licensees/')
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        licenseeFindSpy.mockRestore()
      })
    })
  })

  describe('setDialogWebhook', () => {
    describe('response', () => {
      it('returns status 200 and message if dialog webhook is set', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeCompleteFactory.build())

        await request(expressServer)
          .post(`/resources/licensees/${licensee._id}/dialogwebhook`)
          .set('x-access-token', token)
          .send({ _id: 123 })
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.message).toEqual('Webhook configurado!')
          })
      })

      it('returns status 500 and message if the some error ocurred', async () => {
        const licenseeFindOneSpy = jest
          .spyOn(LicenseeRepositoryDatabase.prototype, 'findFirst')
          .mockImplementation(() => {
            throw new Error('some error')
          })

        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeCompleteFactory.build())

        await request(expressServer)
          .post(`/resources/licensees/${licensee._id}/dialogwebhook`)
          .set('x-access-token', token)
          .send({ _id: 123 })
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        licenseeFindOneSpy.mockRestore()
      })
    })
  })

  describe('sendToPagarMe', () => {
    describe('response', () => {
      it('returns status 200 and message if create on pagar.me API', async () => {
        const recipientCreateFnSpy = jest.spyOn(Recipient.prototype, 'create').mockImplementation(() => {})

        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeCompleteFactory.build())

        await request(expressServer)
          .post(`/resources/licensees/${licensee._id}/integration/pagarme`)
          .set('x-access-token', token)
          .send({ _id: 123 })
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.message).toEqual('Licenciado enviado para a pagar.me!')
          })

        recipientCreateFnSpy.mockRestore()
      })

      it('returns status 200 and message if update on pagar.me API', async () => {
        const recipientCreateFnSpy = jest.spyOn(Recipient.prototype, 'update').mockImplementation(() => {})

        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ recipient_id: '1234' }))

        await request(expressServer)
          .post(`/resources/licensees/${licensee._id}/integration/pagarme`)
          .set('x-access-token', token)
          .send({ _id: 123 })
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.message).toEqual('Licenciado enviado para a pagar.me!')
          })

        recipientCreateFnSpy.mockRestore()
      })

      it('returns status 500 and message if the some error ocurred', async () => {
        const recipientCreateFnSpy = jest.spyOn(Recipient.prototype, 'create').mockImplementation(() => {})
        const licenseeFindOneSpy = jest
          .spyOn(LicenseeRepositoryDatabase.prototype, 'findFirst')
          .mockImplementation(() => {
            throw new Error('some error')
          })

        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeCompleteFactory.build())

        await request(expressServer)
          .post(`/resources/licensees/${licensee._id}/integration/pagarme`)
          .set('x-access-token', token)
          .send({ _id: 123 })
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        licenseeFindOneSpy.mockRestore()
        recipientCreateFnSpy.mockRestore()
      })
    })
  })

  describe('signOrderWebhook', () => {
    describe('response', () => {
      describe('when has pedidos 10 integration data', () => {
        it('returns status 200 and message success', async () => {
          const licenseeRepository = new LicenseeRepositoryDatabase()
          const licensee = await licenseeRepository.create(
            licenseeCompleteFactory.build({ pedidos10_integration: { username: '' } }),
          )
          const signOrderWebhookFnSpy = jest.spyOn(Pedidos10.prototype, 'signOrderWebhook').mockImplementation(() => {})

          await request(expressServer)
            .post(`/resources/licensees/${licensee._id}/sign-order-webhook`)
            .set('x-access-token', token)
            .send({ _id: 123 })
            .expect('Content-Type', /json/)
            .expect(200)
            .then((response) => {
              expect(response.body.message).toEqual('Webhook assinado!')
              expect(signOrderWebhookFnSpy).toHaveBeenCalled()
            })
        })
      })

      describe('when does not have pedidos 10 integration data', () => {
        it('returns status 200 and does not call Pedidos 10 service', async () => {
          const licenseeRepository = new LicenseeRepositoryDatabase()
          const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ pedidos10_integration: {} }))

          await request(expressServer)
            .post(`/resources/licensees/${licensee._id}/sign-order-webhook`)
            .set('x-access-token', token)
            .send({ _id: 123 })
            .expect('Content-Type', /json/)
            .expect(200)
            .then((response) => {
              expect(response.body.message).toEqual('Webhook não assinado pois não tem os dados para o login!')
            })
        })
      })

      it('returns status 500 and message if the some error ocurred', async () => {
        const licenseeFindOneSpy = jest
          .spyOn(LicenseeRepositoryDatabase.prototype, 'findFirst')
          .mockImplementation(() => {
            throw new Error('some error')
          })

        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeCompleteFactory.build())

        await request(expressServer)
          .post(`/resources/licensees/${licensee._id}/dialogwebhook`)
          .set('x-access-token', token)
          .send({ _id: 123 })
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        licenseeFindOneSpy.mockRestore()
      })
    })
  })
})
