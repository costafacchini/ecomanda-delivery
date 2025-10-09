import Auth from './Auth.js'
import Licensee from '@models/Licensee.js'
import Integrationlog from '@models/Integrationlog.js'
import fetchMock from 'fetch-mock'
import mongoServer from '../../../../../../.jest/utils.js'
import { licenseePedidos10 as licenseeFactory   } from '@factories/licensee.js'

describe('Pedidos10/Auth plugin', () => {
  let licensee
  const consoleInfoSpy = jest.spyOn(global.console, 'info').mockImplementation()
  const consoleErrorSpy = jest.spyOn(global.console, 'error').mockImplementation()

  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
    fetchMock.reset()

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

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://extranet.pedidos10.com.br/api-integracao-V1/auth/' &&
              body === JSON.stringify(expectedBody) &&
              headers['Accept'] === 'application/json'
            )
          },
          {
            status: 200,
            body: {
              data: {
                access_token: 'access-token',
              },
            },
          },
        )

        const auth = new Auth(licensee)
        const isLogged = await auth.login()
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

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

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://extranet.pedidos10.com.br/api-integracao-V1/auth/' &&
              body === JSON.stringify(expectedBody) &&
              headers['Accept'] === 'application/json'
            )
          },
          {
            status: 200,
            body: {
              data: {
                access_token: 'access-token',
              },
            },
          },
        )

        const auth = new Auth(licensee)
        await auth.login()
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

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

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://extranet.pedidos10.com.br/api-integracao-V1/auth/' &&
              body === JSON.stringify(expectedBody) &&
              headers['Accept'] === 'application/json'
            )
          },
          {
            status: 200,
            body: bodyResponse,
          },
        )

        const auth = new Auth(licensee)
        await auth.login()
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

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

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://extranet.pedidos10.com.br/api-integracao-V1/auth/' &&
              body === JSON.stringify(expectedBody) &&
              headers['Accept'] === 'application/json'
            )
          },
          {
            status: 422,
            body: {
              error: 'Credenciais para login inválidas',
            },
          },
        )

        const auth = new Auth(licensee)
        const isLogged = await auth.login()
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

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

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://extranet.pedidos10.com.br/api-integracao-V1/auth/' &&
              body === JSON.stringify(expectedBody) &&
              headers['Accept'] === 'application/json'
            )
          },
          {
            status: 422,
            body: bodyResponse,
          },
        )

        const auth = new Auth(licensee)
        await auth.login()
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        const integrationlog = await Integrationlog.findOne({ licensee: licensee._id })
        expect(integrationlog.log_payload).toEqual(bodyResponse)
      })
    })
  })
})
