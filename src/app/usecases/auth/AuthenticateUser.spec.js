import { userSuper as userSuperFactory } from '@factories/user'
import { UserRepositoryMemory } from '@repositories/user'
import {
  AuthenticateUser,
  AuthenticateUserInvalidCredentialsError,
  AuthenticateUserValidationError,
  TOKEN_EXPIRATION,
} from './AuthenticateUser.js'

describe('AuthenticateUser', () => {
  let authenticateUser
  let tokenService
  let userRepository

  beforeEach(() => {
    userRepository = new UserRepositoryMemory()
    tokenService = {
      sign: jest.fn().mockReturnValue('signed-token'),
      secret: 'secret',
    }

    authenticateUser = new AuthenticateUser({
      userRepository,
      tokenService,
    })
  })

  it('returns a signed token when the credentials are valid', async () => {
    const user = await userRepository.create(userSuperFactory.build())

    const token = await authenticateUser.execute({
      email: user.email,
      password: '12345678',
    })

    expect(token).toEqual('signed-token')
    expect(tokenService.sign).toHaveBeenCalledWith({ id: user._id }, tokenService.secret, {
      expiresIn: TOKEN_EXPIRATION,
    })
  })

  it('throws an invalid credentials error when the user does not exist', async () => {
    await expect(
      authenticateUser.execute({
        email: 'missing@doe.com',
        password: '12345678',
      }),
    ).rejects.toBeInstanceOf(AuthenticateUserInvalidCredentialsError)
  })

  it('throws an invalid credentials error when the password does not match', async () => {
    const user = await userRepository.create(userSuperFactory.build())

    await expect(
      authenticateUser.execute({
        email: user.email,
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(AuthenticateUserInvalidCredentialsError)
  })

  it.each([[{ password: '12345678' }], [{ email: 'john@doe.com' }]])(
    'throws a validation error when required credentials are missing: %p',
    async (payload) => {
      await expect(authenticateUser.execute(payload)).rejects.toBeInstanceOf(AuthenticateUserValidationError)
    },
  )
})
