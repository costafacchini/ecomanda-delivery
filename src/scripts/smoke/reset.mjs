import 'dotenv/config'
import mongoose from 'mongoose'
import '../../app/models/index.js'
import { connect } from '../../config/database.js'
import { smokeEnv } from './env.mjs'
import { getSmokeAdminCredentials, resetSmokeData } from './data/seed-data.mjs'

async function main() {
  await connect()

  const adminCredentials = getSmokeAdminCredentials()
  const result = await resetSmokeData(smokeEnv)

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        status: 'ok',
        action: 'reset',
        adminEmail: adminCredentials.email,
        apiToken: smokeEnv.licenseeApiToken,
        deletedLicensees: result.deletedLicensees,
        deletedMessages: result.deletedMessages,
      },
      null,
      2,
    ),
  )
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
