import 'dotenv/config'
import 'module-alias/register'
import '@models/index'
import moment from 'moment'

import Body from '@models/Body'
import { connect } from './src/config/database'
connect()

async function schedule() {
  // This command destroy bodies that are older than 3 days and are concluded, to avoid the database growing too much with old bodies that are not needed anymore. The command is scheduled to run every day at 3am, but you can change the schedule as you want.

  try {
    const threeDaysAgo = moment().subtract(3, 'days')
    const end = moment(threeDaysAgo).endOf('day')

    let res = await Body.deleteMany({ createdAt: { $lt: end.toDate() }, kind: 'normal', concluded: true })
    console.log(`Bodies concluded destroyed: ${res.deletedCount}`)
  } catch (err) {
    console.log(err)
  }
  process.exit()
}

schedule()
