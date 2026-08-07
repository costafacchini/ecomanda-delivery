import { IRepository } from '@repositories/repository'
import { IUser } from '../../../types'

const INVALID_LOGIN_MESSAGE = 'Login inválido!'
const INVALID_CREDENTIALS_MESSAGE = 'Email ou senha inválidos!'
const TOKEN_EXPIRATION = '7d'

interface IUserWithValidPassword extends IUser {
  validPassword(password: string): Promise<boolean>
}

interface AuthenticateUserDeps {
  userRepository: IRepository<IUser>
  tokenService: any
}

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
  userRepository: IRepository<IUser>
  tokenService: any

  constructor({ userRepository, tokenService }: AuthenticateUserDeps) {
    this.userRepository = userRepository
    this.tokenService = tokenService
  }

  async execute({ email, password }: { email?: string; password?: string } = {}): Promise<string> {
    if (!email || !password) {
      throw new AuthenticateUserValidationError()
    }

    const user = await this.userRepository.findFirst({ email, active: true })
    const userWithAuth = user as IUserWithValidPassword | null
    const validPassword = userWithAuth ? await userWithAuth.validPassword(password) : null

    if (!userWithAuth || !validPassword) {
      throw new AuthenticateUserInvalidCredentialsError()
    }

    return this.tokenService.sign({ id: userWithAuth._id }, this.tokenService.secret, {
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
