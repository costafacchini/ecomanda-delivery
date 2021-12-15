require('dotenv').config()
require('module-alias/register')
require('@models/index')
const moment = require('moment')

const request = require('./src/app/services/request')
const Body = require('@models/Body')
const Room = require('@models/Room')
const connect = require('./src/config/database')
connect()

async function schedule() {
  // This command destroy bodies that are older than 1 day

  try {
    const yesterday = moment().subtract(1, 'days')
    const start = moment().subtract(10, 'days')
    const end = moment(yesterday).endOf('day')

    let res = await Body.deleteMany({ createdAt: { $gte: start, $lt: end } })
    console.log(`Bodies concluded destroyed: ${res.deletedCount}`)

    res = await Room.deleteMany({ closed: true })
    console.log(`Rooms concluded destroyed: ${res.deletedCount}`)
  } catch (err) {
    console.log(err)
  }

  // This command is necessary to wake up the heroku application
  await request.get('https://ecomanda-delivery.herokuapp.com/resources')
  // process.exit()
}

schedule()
