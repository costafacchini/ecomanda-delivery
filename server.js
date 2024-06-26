require('dotenv').config()

if (process.env.NODE_ENV === 'production') require('newrelic')

const { server } = require('./src/config/http')
const debug = require('debug')('ecomanda-delivery:server')

require('./src/app/websockets/index')

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
  debug('Listening on ' + bind)
}
