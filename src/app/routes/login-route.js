const router = require('express').Router()
const controller = require('@controllers/LoginController')

router.post('/', controller.login)

module.exports = router
