require('dotenv').config()
require('module-alias/register')
require('@models/index')

const { LicenseeRepositoryDatabase } = require('@repositories/licensee')
const request = require('./src/app/services/request')
const connect = require('./src/config/database')

async function schedule() {
  await connect()

  const licenseeRepository = new LicenseeRepositoryDatabase()
  const licensee = await licenseeRepository.findFirst()

  await request.post(`https://clave-digital.herokuapp.com/api/v1/chatbot/reset?token=${licensee.apiToken}`)

  // process.exit()
}

schedule()
