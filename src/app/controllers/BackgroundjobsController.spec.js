import Backgroundjob from '@models/Backgroundjob'
import request from 'supertest'
import mongoServer from '../../../.jest/utils'
import { queueServer } from '@config/queue'
import { expressServer } from '../../../.jest/server-express'
import { licensee as licenseeFactory } from '@factories/licensee'
import { backgroundjob as backgroundjobFactory } from '@factories/backgroundjob'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'

describe('backgrounndjobs controller', () => {
  let apiToken
  const queueServerAddJobSpy = jest.spyOn(queueServer, 'addJob').mockImplementation(() => Promise.resolve())
  jest.spyOn(global.console, 'info').mockImplementation()

  beforeAll(async () => {
    jest.clearAllMocks()
    await mongoServer.connect()

    const licenseeRepository = new LicenseeRepositoryDatabase()
    const licensee = await licenseeRepository.create(licenseeFactory.build())
    apiToken = licensee.apiToken
  })

  afterAll(async () => {
    await mongoServer.disconnect()
  })

  describe('about auth', () => {
    it('returns status 401 and message if query param token is not valid', async () => {
      await request(expressServer)
        .post('/api/v1/backgroundjobs/?token=627365264')
        .send({
          field: 'test',
        })
        .expect('Content-Type', /json/)
        .expect(401, { message: 'Token não informado ou inválido.' })
    })

    it('returns status 401 and message if query param token is informed', async () => {
      await request(expressServer)
        .post('/api/v1/backgroundjobs')
        .send({
          field: 'test',
        })
        .expect('Content-Type', /json/)
        .expect(401, { message: 'Token não informado ou inválido.' })
    })
  })

  describe('create', () => {
    describe('response', () => {
      it('returns status 200 and schedule job to process payload', async () => {
        await request(expressServer)
          .post(`/api/v1/backgroundjobs/?token=${apiToken}`)
          .send({
            kind: 'get-pix',
            payload: {
              cart_id: 'cart-id',
            },
          })
          .expect('Content-Type', /json/)
          .expect(200)
          .then(async (response) => {
            const backgroundjob = await Backgroundjob.findOne({
              kind: 'get-pix',
              body: { cart_id: 'cart-id' },
            }).populate('body')

            expect(response.body).toEqual({
              body: {
                message: 'Job agendado com sucesso.',
                job_id: backgroundjob._id.toString(),
              },
            })
            expect(queueServerAddJobSpy).toHaveBeenCalledTimes(1)
            expect(queueServerAddJobSpy).toHaveBeenCalledWith('background-job', {
              jobId: backgroundjob._id.toString(),
              licenseeId: backgroundjob.licensee,
            })
          })
      })

      it('returns status 500 and message if the some error ocurred when create the backgroundjob', async () => {
        const backgroundjobSaveSpy = jest.spyOn(Backgroundjob.prototype, 'save').mockImplementation(() => {
          throw new Error('some error')
        })

        await request(expressServer)
          .post(`/api/v1/backgroundjobs/?token=${apiToken}`)
          .send({
            kind: 'get-pix',
            payload: {
              cart_id: 'cart-id',
            },
          })
          .expect('Content-Type', /json/)
          .expect(500, {
            body: {
              message: 'Error: some error',
            },
          })

        backgroundjobSaveSpy.mockRestore()
      })

      describe('validations', () => {
        it('returns status 422 and message if backgroundjob is invalid', async () => {
          await request(expressServer)
            .post(`/api/v1/backgroundjobs/?token=${apiToken}`)
            .send({
              lol: 'hello',
            })
            .expect('Content-Type', /json/)
            .expect(422, {
              errors: [
                {
                  message:
                    'Tipo do job: Você deve informar um valor ( get-pix | cancel-order | get-credit-card | invite-credit-card )',
                },
              ],
            })
        })
      })
    })
  })

  describe('show', () => {
    describe('response', () => {
      it('returns status 200 and backgroundjob if scheduled', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.findFirst({ apiToken })

        const backgroundjob = await Backgroundjob.create(
          backgroundjobFactory.build({
            licensee,
            status: 'scheduled',
          }),
        )

        await request(expressServer)
          .get(`/api/v1/backgroundjobs/${backgroundjob._id}?token=${apiToken}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.message).toEqual(
              'O job está agendado, mas ainda não está executando. Por favor, volte mais tarde!',
            )
          })
      })

      it('returns status 200 and payload response if running', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.findFirst({ apiToken })

        const backgroundjob = await Backgroundjob.create(
          backgroundjobFactory.build({
            licensee,
            status: 'running',
          }),
        )

        await request(expressServer)
          .get(`/api/v1/backgroundjobs/${backgroundjob._id}?token=${apiToken}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.message).toEqual(
              'O job está em execução, logo deve ficar pronto. Por favor, volte daqui a pouco!',
            )
          })
      })

      it('returns status 200 and payload response if done', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.findFirst({ apiToken })

        const backgroundjob = await Backgroundjob.create(
          backgroundjobFactory.build({
            licensee,
            status: 'done',
            response: {
              link: 'https://anything.com',
            },
          }),
        )

        await request(expressServer)
          .get(`/api/v1/backgroundjobs/${backgroundjob._id}?token=${apiToken}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.message).toEqual('Eu concljuí a execução e a resposta esta na key chamada response!')
            expect(response.body.response).toEqual({
              link: 'https://anything.com',
            })
          })
      })

      it('returns status 200 and payload response if error', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.findFirst({ apiToken })

        const backgroundjob = await Backgroundjob.create(
          backgroundjobFactory.build({
            licensee,
            status: 'error',
            error: 'some error',
          }),
        )

        await request(expressServer)
          .get(`/api/v1/backgroundjobs/${backgroundjob._id}?token=${apiToken}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.message).toEqual('some error')
          })
      })

      it('returns status 404 and message if backgroundjobs belongs to another licensee', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeFactory.build())

        const backgroundjob = await Backgroundjob.create(
          backgroundjobFactory.build({
            licensee,
            status: 'scheduled',
            error: 'some error',
            response: {
              link: 'https://anything.com',
            },
          }),
        )

        await request(expressServer)
          .get(`/api/v1/backgroundjobs/${backgroundjob._id}?token=${apiToken}`)
          .expect('Content-Type', /json/)
          .expect(404, {
            errors: { message: `Backgroundjob ${backgroundjob._id} não encontrado` },
          })
      })

      it('returns status 404 and message if backgroundjobs does not exists', async () => {
        await request(expressServer)
          .get(`/api/v1/backgroundjobs/90999999?token=${apiToken}`)
          .expect('Content-Type', /json/)
          .expect(404, {
            errors: { message: `Backgroundjob 90999999 não encontrado` },
          })
      })

      it('returns status 500 and message if occurs another error', async () => {
        const backgroundjobSaveSpy = jest.spyOn(Backgroundjob, 'findOne').mockImplementation(() => {
          throw new Error('some error')
        })

        await request(expressServer)
          .get(`/api/v1/backgroundjobs/9999999999?token=${apiToken}`)
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        backgroundjobSaveSpy.mockRestore()
      })
    })
  })
})
