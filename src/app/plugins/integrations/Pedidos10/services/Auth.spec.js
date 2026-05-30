import { Auth } from './Auth.js'
import Licensee from '@models/Licensee'
import Integrationlog from '@models/Integrationlog'
import { installMemoryRepositories, resetMemoryRepositories } from '@repositories/testing'
import { licenseePedidos10 as licenseeFactory } from '@factories/licensee'
import request from '../../../../services/request.js'
import { createRuntimeDependencies } from '../../../../runtime/dependencies.js'

jest.mock('../../../../services/request')
jest.mock('../../../../helpers/logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn(), fatal: jest.fn() },
}))
import { logger } from '../../../../helpers/logger'

describe('Pedidos10/Auth plugin', () => {
  let licensee
  let dependencies
  const buildAuth = (licensee) =>
    new Auth(licensee, {
      integrationlogRepository: dependencies.integrationlogRepository,
      licenseeRepository: dependencies.licenseeRepository,
    })

  beforeEach(async () => {
    installMemoryRepositories()
    jest.clearAllMocks()
    dependencies = createRuntimeDependencies()
    licensee = await Licensee.create(licenseeFactory.build())
    licensee.pedidos10_integration = {
      integration_token: 'integration-token',
      username: 'username',
      password: 'password',
    }
  })

  afterEach(() => {
    resetMemoryRepositories()
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

        const auth = buildAuth(licensee)
        const isLogged = await auth.login()
        expect(isLogged).toBe(true)
        expect(logger.info).toHaveBeenCalledWith('Login efetuado na API do Pedidos 10! log_id: 1234')

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

        const auth = buildAuth(licensee)
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

        const auth = buildAuth(licensee)
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

        const auth = buildAuth(licensee)
        const isLogged = await auth.login()
        expect(isLogged).toBe(false)
        expect(logger.error).toHaveBeenCalledWith(
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

        const auth = buildAuth(licensee)
        await auth.login()
        const integrationlog = await Integrationlog.findOne({ licensee: licensee._id })
        expect(integrationlog.log_payload).toEqual(bodyResponse)
      })
    })
  })
})
