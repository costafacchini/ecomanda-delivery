import BillingQuery from '@queries/BillingQuery.js'
import mongoServer from '../../../.jest/utils.js'
import { licensee as licenseeFactory   } from '@factories/licensee.js'
import { contact as contactFactory   } from '@factories/contact.js'
import { message as messageFactory   } from '@factories/message.js'
import { LicenseeRepositoryDatabase  } from '@repositories/licensee.js'
import { ContactRepositoryDatabase  } from '@repositories/contact.js'
import { MessageRepositoryDatabase  } from '@repositories/message.js'
import moment from 'moment-timezone'

describe('BillingQuery', () => {
  beforeEach(async () => {
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('returns the billed data for licensees', async () => {
    const licenseeRepository = new LicenseeRepositoryDatabase()
    const licensee1 = await licenseeRepository.create(licenseeFactory.build({ createdAt: '2020-01-01T00:00:00-03:00' }))

    const contactRepository = new ContactRepositoryDatabase()
    const contact1 = await contactRepository.create(contactFactory.build({ licensee: licensee1 }))
    const messageRepository = new MessageRepositoryDatabase()
    await messageRepository.create(
      messageFactory.build({
        contact: contact1,
        licensee: licensee1,
        createdAt: '2020-11-30T00:00:00-03:00',
      }),
    )
    await messageRepository.create(
      messageFactory.build({
        contact: contact1,
        licensee: licensee1,
        createdAt: '2021-12-01T00:00:00-03:00',
      }),
    )
    await messageRepository.create(
      messageFactory.build({
        contact: contact1,
        licensee: licensee1,
        createdAt: '2021-12-31T00:00:00-03:00',
      }),
    )
    await messageRepository.create(
      messageFactory.build({
        contact: contact1,
        licensee: licensee1,
        createdAt: '2022-01-01T00:00:00-03:00',
      }),
    )
    await messageRepository.create(
      messageFactory.build({
        contact: contact1,
        licensee: licensee1,
        createdAt: '2022-01-31T00:00:00-03:00',
      }),
    )
    await messageRepository.create(
      messageFactory.build({
        contact: contact1,
        licensee: licensee1,
        createdAt: '2022-02-01T00:00:00-03:00',
      }),
    )

    const licensee2 = await licenseeRepository.create(licenseeFactory.build({ createdAt: '2022-01-01T00:00:00-03:00' }))
    const contact2 = await contactRepository.create(contactFactory.build({ licensee: licensee2 }))
    await messageRepository.create(
      messageFactory.build({
        contact: contact2,
        licensee: licensee2,
        createdAt: '2022-01-01T00:00:00-03:00',
      }),
    )
    await messageRepository.create(
      messageFactory.build({
        contact: contact2,
        licensee: licensee2,
        createdAt: '2022-01-31T00:00:00-03:00',
      }),
    )

    const licensee3 = await licenseeRepository.create(licenseeFactory.build({ createdAt: '2019-01-01T00:00:00-03:00' }))
    const contact3 = await contactRepository.create(contactFactory.build({ licensee: licensee2 }))
    await messageRepository.create(
      messageFactory.build({
        contact: contact3,
        licensee: licensee3,
        createdAt: '2019-05-01T00:00:00-03:00',
      }),
    )
    await messageRepository.create(
      messageFactory.build({
        contact: contact3,
        licensee: licensee3,
        createdAt: '2019-12-15T00:00:00-03:00',
      }),
    )

    const licensee4 = await licenseeRepository.create(licenseeFactory.build({ createdAt: '2020-05-01T00:00:00-03:00' }))
    const contact4 = await contactRepository.create(contactFactory.build({ licensee: licensee2 }))
    await messageRepository.create(
      messageFactory.build({
        contact: contact4,
        licensee: licensee4,
        createdAt: '2020-05-01T00:00:00-03:00',
      }),
    )
    await messageRepository.create(
      messageFactory.build({
        contact: contact4,
        licensee: licensee4,
        createdAt: '2021-12-01T00:00:00-03:00',
      }),
    )
    await messageRepository.create(
      messageFactory.build({
        contact: contact4,
        licensee: licensee4,
        createdAt: '2021-12-15T00:00:00-03:00',
      }),
    )

    const billingQuery = new BillingQuery(moment('2022-02-10T00:00:00Z').toDate())
    const records = await billingQuery.all()

    expect(records.length).toEqual(4)

    expect(records[0]).toEqual(
      expect.objectContaining({
        _id: licensee1._id,
        name: licensee1.name,
        createdAt: moment('2020-01-01T00:00:00-03:00').toDate(),
        firstMessageDate: moment('2020-11-30T03:00:00.000Z').toDate(),
        lastMessageDate: moment('2022-02-01T03:00:00.000Z').toDate(),
        billing: true,
        messages: [
          {
            month: '12',
            year: '2021',
            count: 2,
          },
          {
            month: '01',
            year: '2022',
            count: 2,
          },
        ],
      }),
    )
    expect(records[1]).toEqual(
      expect.objectContaining({
        _id: licensee2._id,
        name: licensee2.name,
        createdAt: moment('2022-01-01T00:00:00-03:00').toDate(),
        firstMessageDate: moment('2022-01-01T03:00:00.000Z').toDate(),
        lastMessageDate: moment('2022-01-31T03:00:00.000Z').toDate(),
        billing: false,
        messages: [
          {
            month: '12',
            year: '2021',
            count: 0,
          },
          {
            month: '01',
            year: '2022',
            count: 2,
          },
        ],
      }),
    )
    expect(records[2]).toEqual(
      expect.objectContaining({
        _id: licensee3._id,
        name: licensee3.name,
        createdAt: moment('2019-01-01T00:00:00-03:00').toDate(),
        firstMessageDate: moment('2019-05-01T03:00:00.000Z').toDate(),
        lastMessageDate: moment('2019-12-15T03:00:00.000Z').toDate(),
        billing: false,
        messages: [
          {
            month: '12',
            year: '2021',
            count: 0,
          },
          {
            month: '01',
            year: '2022',
            count: 0,
          },
        ],
      }),
    )
    expect(records[3]).toEqual(
      expect.objectContaining({
        _id: licensee4._id,
        name: licensee4.name,
        createdAt: moment('2020-05-01T00:00:00-03:00').toDate(),
        firstMessageDate: moment('2020-05-01T03:00:00.000Z').toDate(),
        lastMessageDate: moment('2021-12-15T03:00:00.000Z').toDate(),
        billing: false,
        messages: [
          {
            month: '12',
            year: '2021',
            count: 2,
          },
          {
            month: '01',
            year: '2022',
            count: 0,
          },
        ],
      }),
    )
  })
})
