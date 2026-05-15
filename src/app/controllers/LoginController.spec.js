import {
  AuthenticateUserInvalidCredentialsError,
  AuthenticateUserValidationError,
  INVALID_CREDENTIALS_MESSAGE,
  INVALID_LOGIN_MESSAGE,
} from '../usecases/auth/AuthenticateUser.js'
import { LoginController } from './LoginController.js'

function buildResponse() {
  return {
    cookie: jest.fn(),
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
  }
}

describe('LoginController', () => {
  let authenticateUser
  let controller

  beforeEach(() => {
    authenticateUser = {
      execute: jest.fn(),
    }

    controller = new LoginController({ authenticateUser })
  })

  it('returns status 200 and the token when authentication succeeds', async () => {
    const req = {
      body: { email: 'john@doe.com', password: '12345678' },
    }
    const res = buildResponse()

    authenticateUser.execute.mockResolvedValue('signed-token')

    await controller.login(req, res)

    expect(authenticateUser.execute).toHaveBeenCalledWith(req.body)
    expect(res.cookie).toHaveBeenCalledWith('access_token', 'signed-token', {
      httpOnly: true,
      secure: expect.any(Boolean),
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ token: 'signed-token' })
  })

  it('returns status 401 when the credentials are invalid', async () => {
    const req = {
      body: { email: 'john@doe.com', password: 'wrong-password' },
    }
    const res = buildResponse()

    authenticateUser.execute.mockRejectedValue(new AuthenticateUserInvalidCredentialsError())

    await controller.login(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: INVALID_CREDENTIALS_MESSAGE })
  })

  it('returns status 422 when the login payload is invalid', async () => {
    const req = {
      body: { email: 'john@doe.com' },
    }
    const res = buildResponse()

    authenticateUser.execute.mockRejectedValue(new AuthenticateUserValidationError())

    await controller.login(req, res)

    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.json).toHaveBeenCalledWith({ message: INVALID_LOGIN_MESSAGE })
  })

  it('returns status 500 when an unexpected exception occurs', async () => {
    const req = {
      body: { email: 'john@doe.com', password: '12345678' },
    }
    const res = buildResponse()

    authenticateUser.execute.mockRejectedValue(new Error('Erro'))

    await controller.login(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ message: 'Erro interno do servidor.' })
  })
})
