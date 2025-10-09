import Trigger from '@models/Trigger.js'
import User from '@models/User.js'
import request from 'supertest'
import mongoServer from '../../../.jest/utils.js'
import { expressServer  } from '../../../.jest/server-express.js'
import { userSuper as userSuperFactory   } from '@factories/user.js'
import { licensee as licenseeFactory   } from '@factories/licensee.js'
import { triggerMultiProduct as triggerFactory   } from '@factories/trigger.js'
import { LicenseeRepositoryDatabase  } from '@repositories/licensee.js'

describe('trigger controller', () => {
  let token
  let licensee

  beforeAll(async () => {
    await mongoServer.connect()

    await User.create(userSuperFactory.build())

    await request(expressServer)
      .post('/login')
      .send({ email: 'john@doe.com', password: '12345678' })
      .then((response) => {
        token = response.body.token
      })

    const licenseeRepository = new LicenseeRepositoryDatabase()
    licensee = await licenseeRepository.create(licenseeFactory.build())
  })

  afterAll(async () => {
    await mongoServer.disconnect()
  })

  describe('about auth', () => {
    it('returns status 401 and message if x-access-token in not inform in header', async () => {
      await request(expressServer)
        .post('/resources/triggers/')
        .send({
          name: 'John Doe',
        })
        .expect('Content-Type', /json/)
        .expect(401, {
          auth: false,
          message: 'Token não informado.',
        })
    })

    it('returns status 500 and message if x-access-token in invalid', async () => {
      await request(expressServer)
        .post('/resources/triggers/')
        .set('x-access-token', 'invalid')
        .send({ name: 'Mary Jane' })
        .expect('Content-Type', /json/)
        .expect(500, {
          auth: false,
          message: 'Falha na autenticação com token.',
        })
    })
  })

  describe('create', () => {
    describe('response', () => {
      it('returns status 201 and the trigger data if the create is successful', async () => {
        await request(expressServer)
          .post('/resources/triggers/')
          .set('x-access-token', token)
          .send(
            triggerFactory.build({
              licensee,
            }),
          )
          .expect('Content-Type', /json/)
          .expect(201)
          .then((response) => {
            expect(response.body.name).toEqual('Send multi products')
            expect(response.body.triggerKind).toEqual('multi_product')
            expect(response.body.expression).toEqual('send_multi_product')
            expect(response.body.catalogMulti).toEqual('catalog')
            expect(response.body.licensee).toEqual(licensee._id.toString())
          })
      })

      it('returns status 422 and message if the trigger is not valid', async () => {
        await request(expressServer)
          .post('/resources/triggers/')
          .set('x-access-token', token)
          .send(triggerFactory.build({ expression: '', licensee }))
          .expect('Content-Type', /json/)
          .expect(422, {
            errors: [{ message: 'Expressão: Você deve preencher o campo' }],
          })
      })

      it('returns status 500 and message if the some error ocurred when create the trigger', async () => {
        const triggerSaveSpy = jest.spyOn(Trigger.prototype, 'save').mockImplementation(() => {
          throw new Error('some error')
        })

        await request(expressServer)
          .post('/resources/triggers/')
          .set('x-access-token', token)
          .send(triggerFactory.build({ licensee }))
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        triggerSaveSpy.mockRestore()
      })

      describe('validations', () => {
        it('returns status 422 and message if triggers is invalid', async () => {
          await request(expressServer)
            .post('/resources/triggers/')
            .set('x-access-token', token)
            .send({
              name: 'Catalog',
            })
            .expect('Content-Type', /json/)
            .expect(422, {
              errors: [
                { message: 'Tipo de Gatilho: Você deve informar um valor ( catalog | summary )' },
                { message: 'Expressão: Você deve preencher o campo' },
                { message: 'Licensee: Você deve preencher o campo' },
              ],
            })
        })
      })
    })
  })

  describe('update', () => {
    describe('response', () => {
      it('returns status 200 and the trigger data if the update is successful', async () => {
        const trigger = await Trigger.create(triggerFactory.build({ licensee }))

        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licenseeNew = await licenseeRepository.create(licenseeFactory.build())

        await request(expressServer)
          .post(`/resources/triggers/${trigger._id}`)
          .set('x-access-token', token)
          .send({
            _id: 123,
            name: 'Another',
            triggerKind: 'single_product',
            expression: 'single',
            catalogSingle: 'single catalog',
            licensee,
          })
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.name).toEqual('Another')
            expect(response.body.triggerKind).toEqual('single_product')
            expect(response.body.expression).toEqual('single')
            expect(response.body.catalogSingle).toEqual('single catalog')
            expect(response.body.licensee).toEqual(licensee._id.toString())

            expect(response.body._id).not.toEqual(123)
            expect(response.body.licensee).not.toEqual(licenseeNew._id.toString())
          })
      })

      it('returns status 422 and message if the trigger is not valid', async () => {
        const trigger = await Trigger.create(triggerFactory.build({ licensee }))

        await request(expressServer)
          .post(`/resources/triggers/${trigger._id}`)
          .set('x-access-token', token)
          .send({ expression: '' })
          .expect('Content-Type', /json/)
          .expect(422, {
            errors: [{ message: 'Expressão: Você deve preencher o campo' }],
          })
      })

      it('returns status 500 and message if the some error ocurre when update the trigger', async () => {
        const triggerFindOneSpy = jest.spyOn(Trigger, 'findOne').mockImplementation(() => {
          throw new Error('some error')
        })

        const trigger = await Trigger.create(triggerFactory.build({ licensee }))

        await request(expressServer)
          .post(`/resources/triggers/${trigger._id}`)
          .set('x-access-token', token)
          .send({ name: 'Name modified' })
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        triggerFindOneSpy.mockRestore()
      })
    })
  })

  describe('show', () => {
    describe('response', () => {
      it('returns status 200 and message if trigger exists', async () => {
        const trigger = await Trigger.create(
          triggerFactory.build({
            name: 'Send single product',
            expression: 'send_single_product',
            triggerKind: 'single_product',
            catalogSingle: 'product',
            licensee,
          }),
        )

        await request(expressServer)
          .get(`/resources/triggers/${trigger._id}`)
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.name).toEqual('Send single product')
            expect(response.body.triggerKind).toEqual('single_product')
            expect(response.body.expression).toEqual('send_single_product')
            expect(response.body.catalogSingle).toEqual('product')
            expect(response.body.licensee._id.toString()).toEqual(licensee._id.toString())
            expect(response.body._id).toEqual(trigger._id.toString())
          })
      })

      it('returns status 404 and message if trigger does not exists', async () => {
        await request(expressServer)
          .get('/resources/triggers/12312')
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(404, {
            errors: { message: 'Trigger 12312 não encontrada' },
          })
      })

      it('returns status 500 and message if occurs another error', async () => {
        const triggerFindOneSpy = jest.spyOn(Trigger, 'findOne').mockImplementation(() => {
          throw new Error('some error')
        })

        await request(expressServer)
          .get('/resources/triggers/12312')
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        triggerFindOneSpy.mockRestore()
      })
    })
  })

  describe('index', () => {
    describe('response', () => {
      it('returns status 200 and message if trigger exists', async () => {
        await request(expressServer)
          .get(`/resources/triggers/?expression=products&page=1&limit=3&kind=single_product`)
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(Array.isArray(response.body)).toEqual(true)
            expect(response.body.length).toEqual(2)
            expect(response.body[1].name).toEqual('Send multi products')
            expect(response.body[1].expression).toEqual('send_multi_product')
            expect(response.body[1].triggerKind).toEqual('multi_product')
            expect(response.body[1].catalogMulti).toEqual('catalog')
            expect(response.body[1].licensee).toEqual(licensee._id.toString())
          })
      })

      it('returns status 500 and message if occurs another error', async () => {
        const triggerFindSpy = jest.spyOn(Trigger, 'find').mockImplementation(() => {
          throw new Error('some error')
        })

        await request(expressServer)
          .get('/resources/triggers/')
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        triggerFindSpy.mockRestore()
      })
    })
  })

  describe('importation', () => {
    describe('response', () => {
      it('returns status 201 if the importation is successful', async () => {
        const trigger = await Trigger.create(triggerFactory.build({ licensee }))

        await request(expressServer)
          .post(`/resources/triggers/${trigger._id}/importation`)
          .set('x-access-token', token)
          .send({
            text: `id	title	description	section
83863	Double Monster Bacon + Refri	2 Monster Bacon Artesanais + 2 Refri Lata 350ml + Entrega grátis.Hamburguer`,
          })
          .expect('Content-Type', /json/)
          .expect(201)
      })

      it('returns status 500 and message if the some error ocurre when update the trigger', async () => {
        const triggerFindOneSpy = jest.spyOn(Trigger, 'findOne').mockImplementation(() => {
          throw new Error('some error')
        })

        const trigger = await Trigger.create(triggerFactory.build({ licensee }))

        await request(expressServer)
          .post(`/resources/triggers/${trigger._id}/importation`)
          .set('x-access-token', token)
          .send({
            text: `id	title	description	section
83863	Double Monster Bacon + Refri	2 Monster Bacon Artesanais + 2 Refri Lata 350ml + Entrega grátis.Hamburguer`,
          })
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        triggerFindOneSpy.mockRestore()
      })
    })
  })
})
