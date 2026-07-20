// BEFORE RUNNING IN PRODUCTION:
// 1. Take a MongoDB backup: mongodump --uri=<MONGO_URI> --out=backup-$(date +%Y%m%d)
// 2. Run on staging first: npx ts-node src/setup/migrations/001-licensee-config-to-inboxes.ts
// 3. Verify inbox counts: db.inboxes.count()
// 4. Run in production with the same command
//
// IDEMPOTENT: Safe to run multiple times. Checks for existing inboxes before creating.

import mongoose from 'mongoose'
import Licensee from '@models/Licensee'
import Inbox from '@models/Inbox'
import Department from '@models/Department'
import WhatsappSession from '@models/WhatsappSession'

async function connectToDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI environment variable is not set')
  await mongoose.connect(uri)
}

async function createMessengerInboxForLicensee(licensee: InstanceType<typeof Licensee>): Promise<void> {
  if (!licensee.whatsappDefault) return

  const exists = await Inbox.findOne({ licensee: licensee._id, kind: 'messenger' })
  if (exists) return

  await Inbox.create({
    name: `WhatsApp — ${licensee.name}`,
    licensee: licensee._id,
    kind: 'messenger',
    whatsappDefault: licensee.whatsappDefault,
    whatsappToken: licensee.whatsappToken,
    whatsappUrl: licensee.whatsappUrl,
    active: true,
  })
}

async function createChatInboxForLicensee(licensee: InstanceType<typeof Licensee>): Promise<void> {
  if (!licensee.chatDefault) return

  const exists = await Inbox.findOne({ licensee: licensee._id, kind: 'chat' })
  if (exists) return

  await Inbox.create({
    name: `Chat — ${licensee.name}`,
    licensee: licensee._id,
    kind: 'chat',
    chatDefault: licensee.chatDefault,
    chatUrl: licensee.chatUrl,
    chatKey: licensee.chatKey,
    chatIdentifier: licensee.chatIdentifier,
    active: true,
  })
}

async function migrateDeprecatedWhatsappSessions(): Promise<void> {
  // Find sessions that still reference a department (pre-inbox schema) with no inbox set.
  // These were created before the inbox concept was introduced.
  const sessions = await WhatsappSession.collection
    .find({
      department: { $exists: true, $ne: null },
      inbox: { $exists: false },
    })
    .toArray()

  for (const session of sessions) {
    const department = await Department.findById(session.department)
    if (!department) continue

    let inbox = department.inbox ? await Inbox.findById(department.inbox) : null

    if (!inbox) {
      inbox = await Inbox.create({
        name: `WhatsApp — ${department.name}`,
        licensee: session.licensee,
        kind: 'messenger',
        whatsappDefault: 'baileys',
        active: true,
      })
      await Department.updateOne({ _id: department._id }, { $set: { inbox: inbox._id } })
    }

    await WhatsappSession.collection.updateOne(
      { _id: session._id },
      { $set: { inbox: inbox._id }, $unset: { department: '' } },
    )
  }
}

export async function migrate(): Promise<void> {
  const licensees = await Licensee.find({})

  for (const licensee of licensees) {
    await createMessengerInboxForLicensee(licensee)
    await createChatInboxForLicensee(licensee)
  }

  await migrateDeprecatedWhatsappSessions()
}

// Allow running directly via ts-node: npx ts-node src/setup/migrations/001-licensee-config-to-inboxes.ts
if (require.main === module) {
  connectToDatabase()
    .then(() => migrate())
    .then(() => {
      console.log(JSON.stringify({ event: 'migration_complete', migration: '001-licensee-config-to-inboxes' }))
      process.exit(0)
    })
    .catch((err: Error) => {
      console.error(
        JSON.stringify({ event: 'migration_failed', migration: '001-licensee-config-to-inboxes', error: err.message }),
      )
      process.exit(1)
    })
}
