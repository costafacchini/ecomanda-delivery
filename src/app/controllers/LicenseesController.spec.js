const Licensee = require('@models/Licensee')
const User = require('@models/User')
const request = require('supertest')
const mongoServer = require('../../../.jest/utils')
const { expressServer } = require('../../../.jest/server-express')
const { licenseeComplete: licenseeCompleteFactory, licensee: licenseeFactory } = require('@factories/licensee')
const { userSuper: userSuperFactory } = require('@factories/user')

describe('licensee controller', () => {
  let token

  beforeAll(async () => {
    await mongoServer.connect()

    await User.create(userSuperFactory.build())

    await request(expressServer)
      .post('/login')
      .send({ email: 'john@doe.com', password: '12345678' })
      .then((response) => {
        token = response.body.token
      })
  })

  afterAll(async () => {
    await mongoServer.disconnect()
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
          })
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
          .send(
            licenseeCompleteFactory.build({ whatsappDefault: 'winzap', whatsappUrl: 'https://api.winzap.com.br/send/' })
          )
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
            expect(response.body.whatsappDefault).toEqual('winzap')
            expect(response.body.chatDefault).toEqual('rocketchat')
            expect(response.body.chatbotUrl).toEqual('https://chatbot.url')
            expect(response.body.chatbotAuthorizationToken).toEqual('chat-bot-token')
            expect(response.body.whatsappToken).toEqual('whatsapp-token')
            expect(response.body.whatsappUrl).toEqual('https://api.winzap.com.br/send/')
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
        const licenseeSaveSpy = jest.spyOn(Licensee.prototype, 'save').mockImplementation(() => {
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
        const licensee = await Licensee.create(licenseeCompleteFactory.build())

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
        const licensee = await Licensee.create(licenseeFactory.build())

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
        const licenseeFindOneSpy = jest.spyOn(Licensee, 'findOne').mockImplementation(() => {
          throw new Error('some error')
        })

        const licensee = await Licensee.create(licenseeFactory.build())

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
          const licensee = await Licensee.create(licenseeFactory.build())

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
        const licensee = await Licensee.create(licenseeCompleteFactory.build())

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
        const licenseeFindOneSpy = jest.spyOn(Licensee, 'findOne').mockImplementation(() => {
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
        await Licensee.create(
          licenseeCompleteFactory.build({
            chatDefault: 'jivochat',
            chatbotDefault: 'landbot',
            whatsappDefault: 'winzap',
            name: 'Alcalina',
          })
        )
        await Licensee.create(
          licenseeCompleteFactory.build({
            chatDefault: 'jivochat',
            chatbotDefault: 'landbot',
            whatsappDefault: 'winzap',
            name: 'Alcateia ltds',
          })
        )
        await Licensee.create(
          licenseeCompleteFactory.build({
            chatDefault: 'jivochat',
            chatbotDefault: 'landbot',
            whatsappDefault: 'winzap',
            name: 'Alcachofra',
          })
        )

        await request(expressServer)
          .get(
            '/resources/licensees/?chatDefault=jivochat&chatbotDefault=landbot&whatsappDefault=winzap&expression=Alca&page=1&limit=3'
          )
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(Array.isArray(response.body)).toEqual(true)
            expect(response.body.length).toEqual(3)
            expect(response.body[1].name).toEqual('Alcateia ltds')
            expect(response.body[1].email).toEqual('alcateia@alcateia.com')
            expect(response.body[1].phone).toEqual('11098538273')
            expect(response.body[1].active).toEqual(true)
            expect(response.body[1].licenseKind).toEqual('demo')
            expect(response.body[1].useChatbot).toEqual(true)
            expect(response.body[1].chatbotDefault).toEqual('landbot')
            expect(response.body[1].whatsappDefault).toEqual('winzap')
            expect(response.body[1].chatDefault).toEqual('jivochat')
            expect(response.body[1].chatbotUrl).toEqual('https://chatbot.url')
            expect(response.body[1].chatbotAuthorizationToken).toEqual('chat-bot-token')
            expect(response.body[1].whatsappToken).toEqual('whatsapp-token')
            expect(response.body[1].whatsappUrl).toEqual('https://api.winzap.com.br/send/')
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
        const licenseeFindSpy = jest.spyOn(Licensee, 'find').mockImplementation(() => {
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
        const licensee = await Licensee.create(licenseeCompleteFactory.build())

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
        const licenseeFindOneSpy = jest.spyOn(Licensee, 'findOne').mockImplementation(() => {
          throw new Error('some error')
        })

        const licensee = await Licensee.create(licenseeCompleteFactory.build())

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
