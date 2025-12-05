import 'dotenv/config'
import './instrument.js'
import debug from 'debug'
import { server } from './src/config/http.js'
import('./src/app/websockets/index.js')

if (process.env.NODE_ENV === 'production') {
  import('newrelic')
}

const errorDebug = debug('ecomanda-delivery:server')

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
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}

function onListening() {
  const addr = server.address()
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'PORT ' + addr.PORT
  errorDebug('Listening on ' + bind)
}
