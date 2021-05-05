const express = require('express')
const controller = require('@controllers/LoginController')

const router = express.Router()

router.post('', controller.login)

module.exports = router
