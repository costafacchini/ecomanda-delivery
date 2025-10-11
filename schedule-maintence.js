import 'dotenv/config'
import 'module-alias/register'
import '@models/index'
import moment from 'moment'

import request from './src/app/services/request'
import Body from '@models/Body'
import Room from '@models/Room'
import connect from './src/config/database'
connect()

async function schedule() {
  // This command destroy bodies that are older than 1 day

  try {
    const yesterday = moment().subtract(1, 'days')
    const start = moment().subtract(10, 'days')
    const end = moment(yesterday).endOf('day')

    let res = await Body.deleteMany({ createdAt: { $gte: start, $lt: end }, kind: 'normal' })
    console.log(`Bodies concluded destroyed: ${res.deletedCount}`)

    res = await Room.deleteMany({ closed: true })
    console.log(`Rooms concluded destroyed: ${res.deletedCount}`)
  } catch (err) {
    console.log(err)
  }

  // This command is necessary to wake up the heroku application
  await request.get('https://clave-digital.herokuapp.com/resources')
  // process.exit()
}

schedule()
