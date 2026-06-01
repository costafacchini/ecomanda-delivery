import express from 'express'
import { rateLimit } from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import jwt from 'jsonwebtoken'
import { LoginController } from '../controllers/LoginController'
import { UserRepositoryDatabase } from '../repositories/user'
import { AuthenticateUser } from '../usecases/auth/AuthenticateUser'
import { redisConnection } from '../../config/redis'

const router = express.Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  store:
    process.env.NODE_ENV !== 'test'
      ? new RedisStore({
          sendCommand: (command, ...args) => redisConnection.call(command, ...args) as any,
          prefix: 'rl:login:',
        })
      : undefined,
})

const SECRET = process.env.SECRET
const userRepository = new UserRepositoryDatabase()
const tokenService = {
  sign: jwt.sign,
  secret: SECRET,
}
const authenticateUser = new AuthenticateUser({ userRepository, tokenService })
const loginController = new LoginController({ authenticateUser })

router.post('/', loginLimiter, loginController.login)

export { router }
