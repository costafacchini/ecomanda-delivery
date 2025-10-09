import mongoServer from '../../../.jest/utils.js'
import MessagesSendedQuery from './MessagesSended.js'
import { licensee as licenseeFactory   } from '@factories/licensee.js'
import { contact as contactFactory   } from '@factories/contact.js'
import { message as messageFactory   } from '@factories/message.js'
import { LicenseeRepositoryDatabase  } from '@repositories/licensee.js'
import { ContactRepositoryDatabase  } from '@repositories/contact.js'
import { MessageRepositoryDatabase  } from '@repositories/message.js'

describe('MessagesSendedQuery', () => {
  let licensee
  let contact

  beforeEach(async () => {
    await mongoServer.connect()

    const licenseeRepository = new LicenseeRepositoryDatabase()
    licensee = await licenseeRepository.create(licenseeFactory.build())

    const contactRepository = new ContactRepositoryDatabase()
    contact = await contactRepository.create(contactFactory.build({ licensee }))
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('returns the messages that sended filtered by licensee and period', async () => {
    const messageRepository = new MessageRepositoryDatabase()
    const filteredMessageSended1 = await messageRepository.create(
      messageFactory.build({
        contact,
        licensee,
        sended: true,
        createdAt: new Date(2021, 6, 3, 0, 0, 0),
      }),
    )
    const filteredMessageSended2 = await messageRepository.create(
      messageFactory.build({
        contact,
        licensee,
        sended: true,
        createdAt: new Date(2021, 6, 3, 23, 59, 58),
      }),
    )
    const filteredMessageNotSended = await messageRepository.create(
      messageFactory.build({
        contact,
        licensee,
        sended: false,
        createdAt: new Date(2021, 6, 3, 23, 59, 58),
      }),
    )
    const filteredMessageBefore = await messageRepository.create(
      messageFactory.build({
        contact,
        licensee,
        sended: true,
        createdAt: new Date(2021, 6, 2, 23, 59, 59),
      }),
    )
    const filteredMessageAfter = await messageRepository.create(
      messageFactory.build({
        contact,
        licensee,
        sended: true,
        createdAt: new Date(2021, 6, 4, 0, 0, 0),
      }),
    )

    const licenseeRepository = new LicenseeRepositoryDatabase()
    const anotherLicensee = await licenseeRepository.create(licenseeFactory.build())
    const messageSendedAnotherLicensee = await messageRepository.create(
      messageFactory.build({
        contact,
        licensee: anotherLicensee,
        sended: true,
        createdAt: new Date(2021, 6, 3, 0, 0, 0),
      }),
    )

    const messagesSendedQuery = new MessagesSendedQuery(
      new Date(2021, 6, 3, 0, 0, 0),
      new Date(2021, 6, 3, 23, 59, 59),
      licensee._id,
    )
    const records = await messagesSendedQuery.all()

    expect(records.length).toEqual(2)
    expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: filteredMessageSended1._id })]))
    expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: filteredMessageSended2._id })]))
    expect(records).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ _id: filteredMessageNotSended._id })]),
    )
    expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: filteredMessageBefore._id })]))
    expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: filteredMessageAfter._id })]))
    expect(records).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ _id: messageSendedAnotherLicensee._id })]),
    )
  })
})
