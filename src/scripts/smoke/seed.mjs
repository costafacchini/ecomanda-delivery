import 'dotenv/config'
import mongoose from 'mongoose'
import { connect } from '../../config/database.js'
import { smokeEnv } from './env.mjs'
import { buildSmokeSeedData, seedSmokeData } from './data/seed-data.mjs'

async function main() {
  await connect()

  const data = await seedSmokeData(smokeEnv)
  const payloads = buildSmokeSeedData(smokeEnv)

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        status: 'ok',
        action: 'seed',
        adminEmail: data.adminCredentials.email,
        adminPassword: data.adminCredentials.password,
        apiToken: data.licensee.apiToken,
        licenseeId: data.licensee._id.toString(),
        contactId: data.contact._id.toString(),
        roomId: data.room.roomId,
        payloadFixtures: {
          messengerInbound: 'src/scripts/smoke/payloads/messenger-inbound-text.json',
          chatOutbound: 'src/scripts/smoke/payloads/chat-outbound-message.json',
        },
        smokeDefaults: {
          apiProxyTarget: smokeEnv.apiProxyTarget,
          chatProvider: smokeEnv.chatProvider,
          messengerProvider: smokeEnv.messengerProvider,
        },
        seededRecords: {
          messages: payloads.messages.length,
          trigger: payloads.trigger.expression,
          template: payloads.template.name,
          cart: payloads.cart._id.toString(),
          backgroundjob: payloads.backgroundjob._id.toString(),
        },
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
