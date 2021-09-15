require('dotenv').config()
require('module-alias/register')
require('@models/index')

const queueServer = require('@config/queue')

const connect = require('./src/config/database')
connect()

async function schedule() {
  var params = process.argv.slice(2)
  await queueServer.addJob('import-data', {
    databaseUrl: params[0],
    licenseeId: params[1],
  })

  // process.exit()
}

schedule()
