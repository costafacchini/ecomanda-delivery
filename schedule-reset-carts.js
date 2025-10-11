import 'dotenv/config'
import 'module-alias/register'
import '@models/index'

import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import request from './src/app/services/request'
import connect from './src/config/database'

async function schedule() {
  await connect()

  const licenseeRepository = new LicenseeRepositoryDatabase()
  const licensee = await licenseeRepository.findFirst()

  await request.post(`https://clave-digital.herokuapp.com/api/v1/carts/reset?token=${licensee.apiToken}`)

  // process.exit()
}

schedule()
