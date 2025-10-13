import mongoServer from '../../../.jest/utils'
import { MessagesFailedQuery } from './MessagesFailed'
import { licensee as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { message as messageFactory } from '@factories/message'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { ContactRepositoryDatabase } from '@repositories/contact'
import { MessageRepositoryDatabase } from '@repositories/message'

describe('MessagesFailedQuery', () => {
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

  it('returns the messages that not sended filtered by licensee and period', async () => {
    const messageRepository = new MessageRepositoryDatabase()
    const filteredMessageNotSended1 = await messageRepository.create(
      messageFactory.build({
        contact,
        licensee,
        sended: false,
        createdAt: new Date(2021, 6, 3, 0, 0, 0),
      }),
    )
    const filteredMessageNotSended2 = await messageRepository.create(
      messageFactory.build({
        contact,
        licensee,
        sended: false,
        createdAt: new Date(2021, 6, 3, 23, 59, 58),
      }),
    )
    const filteredMessageSended = await messageRepository.create(
      messageFactory.build({
        contact,
        licensee,
        sended: true,
        createdAt: new Date(2021, 6, 3, 23, 59, 58),
      }),
    )
    const filteredMessageBefore = await messageRepository.create(
      messageFactory.build({
        contact,
        licensee,
        sended: false,
        createdAt: new Date(2021, 6, 2, 23, 59, 59),
      }),
    )
    const filteredMessageAfter = await messageRepository.create(
      messageFactory.build({
        contact,
        licensee,
        sended: false,
        createdAt: new Date(2021, 6, 4, 0, 0, 0),
      }),
    )
    const licenseeRepository = new LicenseeRepositoryDatabase()
    const anotherLicensee = await licenseeRepository.create(licenseeFactory.build())
    const messageSendedAnotherLicensee = await messageRepository.create(
      messageFactory.build({
        contact,
        licensee: anotherLicensee,
        sended: false,
        createdAt: new Date(2021, 6, 3, 0, 0, 0),
      }),
    )
    const filteredMessageNotSendedChatEndedByAgent = await messageRepository.create(
      messageFactory.build({
        text: 'Chat encerrado pelo agente',
        contact,
        licensee,
        sended: false,
        createdAt: new Date(2021, 6, 3, 23, 59, 58),
      }),
    )

    const messagesFailedQuery = new MessagesFailedQuery(
      new Date(2021, 6, 3, 0, 0, 0),
      new Date(2021, 6, 3, 23, 59, 59),
      licensee._id,
    )
    const records = await messagesFailedQuery.all()

    expect(records.length).toEqual(2)
    expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: filteredMessageNotSended1._id })]))
    expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: filteredMessageNotSended2._id })]))
    expect(records).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ _id: filteredMessageNotSendedChatEndedByAgent._id })]),
    )
    expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: filteredMessageSended._id })]))
    expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: filteredMessageBefore._id })]))
    expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: filteredMessageAfter._id })]))
    expect(records).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ _id: messageSendedAnotherLicensee._id })]),
    )
  })
})
