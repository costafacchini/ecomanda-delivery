import { Request, Response } from 'express'
import {
  AuthenticateUser,
  AuthenticateUserInvalidCredentialsError,
  AuthenticateUserValidationError,
} from '../usecases/auth/AuthenticateUser'

class LoginController {
  authenticateUser: AuthenticateUser

  constructor({ authenticateUser }: { authenticateUser?: AuthenticateUser } = {}) {
    this.authenticateUser = authenticateUser!

    this.login = this.login.bind(this)
  }

  async login(req: Request, res: Response) {
    try {
      const token = await this.authenticateUser.execute(req.body)

      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
      res.cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: SEVEN_DAYS_MS,
      })

      return res.status(200).json({ token })
    } catch (err) {
      if (err instanceof AuthenticateUserInvalidCredentialsError) {
        return res.status(401).json({ message: err.message })
      }

      if (err instanceof AuthenticateUserValidationError) {
        return res.status(422).json({ message: err.message })
      }

      return res.status(500).json({ message: 'Erro interno do servidor.' })
    }
  }
}

export { LoginController }
