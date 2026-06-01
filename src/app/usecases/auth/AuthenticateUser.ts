const INVALID_LOGIN_MESSAGE = 'Login inválido!'
const INVALID_CREDENTIALS_MESSAGE = 'Email ou senha inválidos!'
const TOKEN_EXPIRATION = '7d'

class AuthenticateUserValidationError extends Error {
  constructor(message = INVALID_LOGIN_MESSAGE) {
    super(message)
    this.name = 'AuthenticateUserValidationError'
  }
}

class AuthenticateUserInvalidCredentialsError extends Error {
  constructor(message = INVALID_CREDENTIALS_MESSAGE) {
    super(message)
    this.name = 'AuthenticateUserInvalidCredentialsError'
  }
}

class AuthenticateUser {
  userRepository: any
  tokenService: any

  constructor({ userRepository, tokenService }: Record<string, any> = {}) {
    this.userRepository = userRepository
    this.tokenService = tokenService
  }

  async execute({ email, password }: Record<string, any> = {}) {
    if (!email || !password) {
      throw new AuthenticateUserValidationError()
    }

    const user = await this.userRepository.findFirst({ email, active: true })
    const validPassword = user ? await user.validPassword(password) : null

    if (!user || !validPassword) {
      throw new AuthenticateUserInvalidCredentialsError()
    }

    return this.tokenService.sign({ id: user._id }, this.tokenService.secret, {
      expiresIn: TOKEN_EXPIRATION,
    })
  }
}

export {
  AuthenticateUser,
  AuthenticateUserInvalidCredentialsError,
  AuthenticateUserValidationError,
  INVALID_CREDENTIALS_MESSAGE,
  INVALID_LOGIN_MESSAGE,
  TOKEN_EXPIRATION,
}
