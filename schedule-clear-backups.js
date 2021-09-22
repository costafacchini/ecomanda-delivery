require('dotenv').config()
require('module-alias/register')
require('@models/index')

const queueServer = require('@config/queue')

const connect = require('./src/config/database')
connect()

async function schedule() {
  await queueServer.addJob('clear-backups')

  // process.exit()
}

schedule()
