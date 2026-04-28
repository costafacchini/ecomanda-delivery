import express from 'express'
import jwt from 'jsonwebtoken'
import { LoginController } from '../controllers/LoginController.js'
import { UserRepositoryDatabase } from '../repositories/user.js'
import { AuthenticateUser } from '../usecases/auth/AuthenticateUser.js'

const router = express.Router()
const SECRET = process.env.SECRET
const userRepository = new UserRepositoryDatabase()
const tokenService = {
  sign: jwt.sign,
  secret: SECRET,
}
const authenticateUser = new AuthenticateUser({ userRepository, tokenService })
const loginController = new LoginController({ authenticateUser })

router.post('/', loginController.login)

export { router }
