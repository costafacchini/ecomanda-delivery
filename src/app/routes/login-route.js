import express from 'express'
import jwt from 'jsonwebtoken'
import { login } from '../controllers/LoginController.js'
import { UserRepositoryDatabase } from '../repositories/user.js'

const router = express.Router()
const SECRET = process.env.SECRET
const userRepository = new UserRepositoryDatabase()

router.post('/', (req, res) => login(req, res, { userRepository, signToken: jwt.sign, secret: SECRET }))

export { router }
