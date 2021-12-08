require('dotenv').config()
require('module-alias/register')
require('@models/index')

const request = require('./src/app/services/request')
const Licensee = require('@models/Licensee')
const connect = require('./src/config/database')
connect()

async function schedule() {
  const licensee = await Licensee.findOne()

  await request.post(`http://localhost:5000/api/v1/chatbot/reset?token=${licensee.apiToken}`)

  // process.exit()
}

schedule()
