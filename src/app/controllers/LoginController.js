import {
  AuthenticateUserInvalidCredentialsError,
  AuthenticateUserValidationError,
} from '../usecases/auth/AuthenticateUser.js'

class LoginController {
  constructor({ authenticateUser } = {}) {
    this.authenticateUser = authenticateUser

    this.login = this.login.bind(this)
  }

  async login(req, res) {
    try {
      const token = await this.authenticateUser.execute(req.body)
      return res.status(200).json({ token })
    } catch (err) {
      if (err instanceof AuthenticateUserInvalidCredentialsError) {
        return res.status(401).json({ message: err.message })
      }

      if (err instanceof AuthenticateUserValidationError) {
        return res.status(422).json({ message: err.message })
      }

      return res.status(500).json({ message: `Erro ao tentar fazer login. ${err}` })
    }
  }
}

export { LoginController }
