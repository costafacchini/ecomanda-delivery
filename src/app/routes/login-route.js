import express from 'express'
import controller from '@controllers/LoginController.js'

const router = express.Router()

router.post('/', controller.login)

export default router
