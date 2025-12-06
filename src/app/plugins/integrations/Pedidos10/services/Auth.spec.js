import { Auth } from './Auth.js'
import Licensee from '@models/Licensee'
import Integrationlog from '@models/Integrationlog'
import mongoServer from '../../../../../../.jest/utils'
import { licenseePedidos10 as licenseeFactory } from '@factories/licensee'
import request from '../../../../services/request.js'

jest.mock('../../../../services/request')

describe('Pedidos10/Auth plugin', () => {
  let licensee
  const consoleInfoSpy = jest.spyOn(global.console, 'info').mockImplementation()
  const consoleErrorSpy = jest.spyOn(global.console, 'error').mockImplementation()

  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
    licensee = await Licensee.create(licenseeFactory.build())
    licensee.pedidos10_integration = {
      integration_token: 'integration-token',
      username: 'username',
      password: 'password',
    }
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#login', () => {
    describe('when success', () => {
      it('logins on Pedidos 10 API', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        const expectedBody = {
          integration_token: 'integration-token',
          username: 'username',
          password: 'password',
        }

        request.post.mockResolvedValueOnce({
          status: 200,
          data: {
            data: {
              access_token: 'access-token',
            },
          },
        })

        const auth = new Auth(licensee)
        const isLogged = await auth.login()
        expect(isLogged).toBe(true)
        expect(consoleInfoSpy).toHaveBeenCalledWith('Login efetuado na API do Pedidos 10! log_id: 1234')

        integrationlogCreateSpy.mockRestore()
      })

      it('saves the access_token on licensee', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        const expectedBody = {
          integration_token: 'integration-token',
          username: 'username',
          password: 'password',
        }

        request.post.mockResolvedValueOnce({
          status: 200,
          data: {
            data: {
              access_token: 'access-token',
            },
          },
        })

        const auth = new Auth(licensee)
        await auth.login()
        const licenseeUpdated = await Licensee.findById(licensee._id)
        expect(licenseeUpdated.pedidos10_integration.access_token).toEqual('access-token')
        expect(licenseeUpdated.pedidos10_integration.authenticated).toEqual(true)

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const expectedBody = {
          integration_token: 'integration-token',
          username: 'username',
          password: 'password',
        }

        const bodyResponse = {
          data: {
            access_token: 'access-token',
          },
        }

        request.post.mockResolvedValueOnce({
          status: 200,
          data: bodyResponse,
        })

        const auth = new Auth(licensee)
        await auth.login()
        const integrationlog = await Integrationlog.findOne({ licensee: licensee._id })
        expect(integrationlog.log_payload).toEqual(bodyResponse)
      })
    })

    describe('when error', () => {
      it('logs the error message', async () => {
        const integrationlogCreateSpy = jest.spyOn(Integrationlog, 'create').mockImplementation(() => {
          return { _id: '1234' }
        })

        const expectedBody = {
          integration_token: 'integration-token',
          username: 'username',
          password: 'password',
        }

        request.post.mockResolvedValueOnce({
          status: 422,
          data: {
            error: 'Credenciais para login inválidas',
          },
        })

        const auth = new Auth(licensee)
        const isLogged = await auth.login()
        expect(isLogged).toBe(false)
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          `Não foi possível fazer a autenticação na API do Pedidos 10
           status: 422
           mensagem: {"error":"Credenciais para login inválidas"}
           log_id: 1234`,
        )

        integrationlogCreateSpy.mockRestore()
      })

      it('creates a record on integrationlog', async () => {
        const expectedBody = {
          integration_token: 'integration-token',
          username: 'username',
          password: 'password',
        }

        const bodyResponse = {
          error: 'Credenciais para login inválidas',
        }

        request.post.mockResolvedValueOnce({
          status: 422,
          data: bodyResponse,
        })

        const auth = new Auth(licensee)
        await auth.login()
        const integrationlog = await Integrationlog.findOne({ licensee: licensee._id })
        expect(integrationlog.log_payload).toEqual(bodyResponse)
      })
    })
  })
})
