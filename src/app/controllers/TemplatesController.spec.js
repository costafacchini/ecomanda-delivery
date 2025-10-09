import Template from '@models/Template.js'
import User from '@models/User.js'
import request from 'supertest'
import mongoServer from '../../../.jest/utils.js'
import { expressServer  } from '../../../.jest/server-express.js'
import Dialog from '@plugins/messengers/Dialog.js'
import { userSuper as userSuperFactory   } from '@factories/user.js'
import { licensee as licenseeFactory   } from '@factories/licensee.js'
import { template as templateFactory   } from '@factories/template.js'
import { LicenseeRepositoryDatabase  } from '@repositories/licensee.js'

describe('template controller', () => {
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
        .post('/resources/templates/')
        .send({
          name: 'template',
        })
        .expect('Content-Type', /json/)
        .expect(401, {
          auth: false,
          message: 'Token não informado.',
        })
    })

    it('returns status 500 and message if x-access-token in invalid', async () => {
      await request(expressServer)
        .post('/resources/templates/')
        .set('x-access-token', 'invalid')
        .send({ name: 'outro' })
        .expect('Content-Type', /json/)
        .expect(500, {
          auth: false,
          message: 'Falha na autenticação com token.',
        })
    })
  })

  describe('create', () => {
    describe('response', () => {
      it('returns status 201 and the template data if the create is successful', async () => {
        await request(expressServer)
          .post('/resources/templates/')
          .set('x-access-token', token)
          .send(
            templateFactory.build({
              licensee,
            }),
          )
          .expect('Content-Type', /json/)
          .expect(201)
          .then((response) => {
            expect(response.body.name).toEqual('template')
            expect(response.body.namespace).toEqual('Namespace')
            expect(response.body.licensee).toEqual(licensee._id.toString())
          })
      })

      it('returns status 422 and message if the template is not valid', async () => {
        await request(expressServer)
          .post('/resources/templates/')
          .set('x-access-token', token)
          .send(templateFactory.build({ name: '', licensee }))
          .expect('Content-Type', /json/)
          .expect(422, {
            errors: [{ message: 'Nome: Você deve preencher o campo' }],
          })
      })

      it('returns status 500 and message if the some error ocurred when create the template', async () => {
        const templateSaveSpy = jest.spyOn(Template.prototype, 'save').mockImplementation(() => {
          throw new Error('some error')
        })

        await request(expressServer)
          .post('/resources/templates/')
          .set('x-access-token', token)
          .send(templateFactory.build({ licensee }))
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        templateSaveSpy.mockRestore()
      })

      describe('validations', () => {
        it('returns status 422 and message if templates is invalid', async () => {
          await request(expressServer)
            .post('/resources/templates/')
            .set('x-access-token', token)
            .send({
              name: 'Template',
            })
            .expect('Content-Type', /json/)
            .expect(422, {
              errors: [{ message: 'Licensee: Você deve preencher o campo' }],
            })
        })
      })
    })
  })

  describe('update', () => {
    describe('response', () => {
      it('returns status 200 and the template data if the update is successful', async () => {
        const template = await Template.create(templateFactory.build({ licensee }))

        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licenseeNew = await licenseeRepository.create(licenseeFactory.build())

        await request(expressServer)
          .post(`/resources/templates/${template._id}`)
          .set('x-access-token', token)
          .send({
            _id: 123,
            name: 'another',
            namespace: 'Other',
            licensee,
          })
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.name).toEqual('another')
            expect(response.body.namespace).toEqual('Other')
            expect(response.body.licensee).toEqual(licensee._id.toString())

            expect(response.body._id).not.toEqual(123)
            expect(response.body.licensee).not.toEqual(licenseeNew._id.toString())
          })
      })

      it('returns status 422 and message if the template is not valid', async () => {
        const template = await Template.create(templateFactory.build({ licensee }))

        await request(expressServer)
          .post(`/resources/templates/${template._id}`)
          .set('x-access-token', token)
          .send({ name: '' })
          .expect('Content-Type', /json/)
          .expect(422, {
            errors: [{ message: 'Nome: Você deve preencher o campo' }],
          })
      })

      it('returns status 500 and message if the some error ocurre when update the template', async () => {
        const templateFindOneSpy = jest.spyOn(Template, 'findOne').mockImplementation(() => {
          throw new Error('some error')
        })

        const template = await Template.create(templateFactory.build({ licensee }))

        await request(expressServer)
          .post(`/resources/templates/${template._id}`)
          .set('x-access-token', token)
          .send({ name: 'Name modified' })
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        templateFindOneSpy.mockRestore()
      })
    })
  })

  describe('show', () => {
    describe('response', () => {
      it('returns status 200 and message if template exists', async () => {
        const template = await Template.create(
          templateFactory.build({
            name: 'name',
            namespace: 'test',
            licensee,
          }),
        )

        await request(expressServer)
          .get(`/resources/templates/${template._id}`)
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.name).toEqual('name')
            expect(response.body.namespace).toEqual('test')
            expect(response.body.licensee._id.toString()).toEqual(licensee._id.toString())
            expect(response.body._id).toEqual(template._id.toString())
          })
      })

      it('returns status 404 and message if template does not exists', async () => {
        await request(expressServer)
          .get('/resources/templates/12312')
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(404, {
            errors: { message: 'Template 12312 não encontrado' },
          })
      })

      it('returns status 500 and message if occurs another error', async () => {
        const templateFindOneSpy = jest.spyOn(Template, 'findOne').mockImplementation(() => {
          throw new Error('some error')
        })

        await request(expressServer)
          .get('/resources/templates/12312')
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        templateFindOneSpy.mockRestore()
      })
    })
  })

  describe('index', () => {
    describe('response', () => {
      it('returns status 200 and message if template exists', async () => {
        await Template.create(templateFactory.build({ licensee }))
        await Template.create(templateFactory.build({ licensee }))
        await Template.create(templateFactory.build({ licensee }))
        await Template.create(templateFactory.build({ licensee }))

        await request(expressServer)
          .get(`/resources/templates/?expression=template&page=1&limit=3`)
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(Array.isArray(response.body)).toEqual(true)
            expect(response.body.length).toEqual(3)
            expect(response.body[1].name).toEqual('template')
            expect(response.body[1].namespace).toEqual('Namespace')
            expect(response.body[1].licensee).toEqual(licensee._id.toString())
          })
      })

      it('returns status 500 and message if occurs another error', async () => {
        const templateFindSpy = jest.spyOn(Template, 'find').mockImplementation(() => {
          throw new Error('some error')
        })

        await request(expressServer)
          .get('/resources/templates/')
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        templateFindSpy.mockRestore()
      })
    })
  })

  describe('importation', () => {
    describe('response', () => {
      it('returns status 201 if the importation is successful', async () => {
        jest.spyOn(Dialog.prototype, 'searchTemplates').mockImplementation(() => {})

        await request(expressServer)
          .post(`/resources/templates/${licensee._id}/importation`)
          .set('x-access-token', token)
          .expect(201)
      })

      it('returns status 500 and message if the some error ocurre when update the template', async () => {
        const licenseeFindOneSpy = jest
          .spyOn(LicenseeRepositoryDatabase.prototype, 'findFirst')
          .mockImplementation(() => {
            throw new Error('some error')
          })

        await request(expressServer)
          .post(`/resources/templates/${licensee._id}/importation`)
          .set('x-access-token', token)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        licenseeFindOneSpy.mockRestore()
      })
    })
  })
})
