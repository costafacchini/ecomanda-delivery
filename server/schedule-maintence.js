require('dotenv').config()
require('module-alias/register')
require('@models/index')

const request = require('./src/app/services/request')
const Body = require('@models/Body')
const connect = require('./src/config/database')
connect()

async function schedule() {
  // This command destroy bodies that are concluded
  const res = await Body.deleteMany({ concluded: true })
  console.log(`Bodies concluded destroyed: ${res.deletedCount}`)

  // This command is necessary to wake up the heroku application
  await request.get('https://ecomanda-delivery.herokuapp.com/resources')
  // process.exit()
}

schedule()
