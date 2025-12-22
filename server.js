import 'dotenv/config'
import './instrument.mjs'
import { server } from './src/config/http.js'
import { logger } from './src/setup/logger.js'
import('./src/app/websockets/index.js')

if (process.env.NODE_ENV === 'production') {
  import('newrelic')
}

const PORT = process.env.PORT || '5000'

server.listen(PORT)
server.on('error', onError)

server.on('listening', onListening)

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT

  switch (error.code) {
    case 'EACCES':
      logger.fatal('Requires elevated privileges', { err: error, bind })
      process.exit(1)
      break
    case 'EADDRINUSE':
      logger.fatal('Port is already in use', { err: error, bind })
      process.exit(1)
      break
    default:
      throw error
  }
}

function onListening() {
  const addr = server.address()
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'PORT ' + addr.port
  logger.info('Server listening', { bind })
}
