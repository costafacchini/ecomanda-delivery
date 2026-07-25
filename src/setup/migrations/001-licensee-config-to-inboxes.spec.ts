import mongoServer from '../../../.jest/utils'
import Licensee from '@models/Licensee'
import Inbox from '@models/Inbox'
import Department from '@models/Department'
import WhatsappSession from '@models/WhatsappSession'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { licensee as licenseeFactory } from '@factories/licensee'
import { migrate } from './001-licensee-config-to-inboxes'
import mongoose from 'mongoose'

const licenseeRepository = new LicenseeRepositoryDatabase()

describe('001-licensee-config-to-inboxes migration', () => {
  beforeEach(async () => {
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  // Story 4 / Scenario 1
  it('creates a messenger inbox for a licensee with whatsappDefault set', async () => {
    const licensee = await licenseeRepository.create(licenseeFactory.build({ whatsappDefault: 'baileys' }))

    await migrate()

    const inbox = await Inbox.findOne({ licensee: licensee._id, kind: 'messenger' })
    expect(inbox).not.toBeNull()
    expect(inbox!.name).toBe(`WhatsApp — ${licensee.name}`)
    expect(inbox!.whatsappDefault).toBe('baileys')
    expect(inbox!.active).toBe(true)
  })

  // Story 4 / Scenario 2
  it('creates a chat inbox for a licensee with chatDefault set', async () => {
    const licensee = await licenseeRepository.create(licenseeFactory.build({ chatDefault: 'local' }))

    await migrate()

    const inbox = await Inbox.findOne({ licensee: licensee._id, kind: 'chat' })
    expect(inbox).not.toBeNull()
    expect(inbox!.name).toBe(`Chat — ${licensee.name}`)
    expect(inbox!.chatDefault).toBe('local')
    expect(inbox!.active).toBe(true)
  })

  // Story 4 / Scenario 3
  it('migrates a department WhatsappSession to inbox-based session and sets department.inbox', async () => {
    const licensee = await licenseeRepository.create(licenseeFactory.build())
    const userId = new mongoose.Types.ObjectId()
    const department = await Department.create({
      name: 'Suporte',
      licensee: licensee._id,
      users: [userId],
    })

    // Insert a legacy session with `department` field and no `inbox` field
    const sessionId = new mongoose.Types.ObjectId()
    await WhatsappSession.collection.insertOne({
      _id: sessionId,
      licensee: licensee._id,
      department: department._id,
      creds: {},
      keys: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await migrate()

    const updatedSession = await WhatsappSession.collection.findOne({ _id: sessionId })
    expect(updatedSession!.inbox).toBeDefined()
    expect(updatedSession!.department).toBeUndefined()

    const updatedDepartment = await Department.findById(department._id)
    expect(updatedDepartment!.inbox).not.toBeNull()

    const createdInbox = await Inbox.findById(updatedSession!.inbox)
    expect(createdInbox).not.toBeNull()
    expect(createdInbox!.kind).toBe('messenger')
    expect(createdInbox!.name).toBe(`WhatsApp — ${department.name}`)
  })

  // Story 4 / Scenario 4
  it('does not create any inbox for a licensee with no plugin config', async () => {
    await licenseeRepository.create(licenseeFactory.build({ whatsappDefault: '', chatDefault: '' }))

    await migrate()

    const count = await Inbox.countDocuments()
    expect(count).toBe(0)
  })

  // Story 4 / Scenario 5
  it('is idempotent — running twice does not create duplicate inboxes', async () => {
    const licensee = await licenseeRepository.create(
      licenseeFactory.build({ whatsappDefault: 'baileys', chatDefault: 'local' }),
    )

    await migrate()
    await migrate()

    const messengerCount = await Inbox.countDocuments({ licensee: licensee._id, kind: 'messenger' })
    const chatCount = await Inbox.countDocuments({ licensee: licensee._id, kind: 'chat' })

    expect(messengerCount).toBe(1)
    expect(chatCount).toBe(1)
  })
})
