const express = require('express')
const routes = require('../config/routes')

const expressServer = express()

expressServer.use(express.json())
expressServer.use(express.urlencoded({ extended: false }))
routes(expressServer)

module.exports = { expressServer }