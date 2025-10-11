import express from 'express'
import routes from '../src/config/routes'

const expressServer = express()

expressServer.use(express.json())
expressServer.use(express.urlencoded({ extended: false }))
routes(expressServer)

export { expressServer }
