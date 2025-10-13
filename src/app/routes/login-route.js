import express from 'express'
import { login } from '../controllers/LoginController.js'

const router = express.Router()

router.post('/', login)

export { router }
