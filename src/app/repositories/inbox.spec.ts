import Inbox from '@models/Inbox'
import mongoServer from '../../../.jest/utils'
import { licensee as licenseeFactory } from '@factories/licensee'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { InboxRepositoryDatabase } from '@repositories/inbox'

describe('inbox repository database', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#model', () => {
    it('returns the Inbox model', () => {
      const inboxRepository = new InboxRepositoryDatabase()

      expect(inboxRepository.model()).toEqual(Inbox)
    })
  })

  describe('#create', () => {
    it('creates an inbox', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const inboxRepository = new InboxRepositoryDatabase()
      const inbox = await inboxRepository.create({ name: 'Suporte', licensee, kind: 'messenger', active: true })

      expect(inbox).toEqual(
        expect.objectContaining({
          name: 'Suporte',
          active: true,
        }),
      )
    })
  })

  describe('#find', () => {
    it('filters by licensee', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())
      const otherLicensee = await licenseeRepository.create(licenseeFactory.build())

      const inboxRepository = new InboxRepositoryDatabase()
      await inboxRepository.create({ name: 'Suporte', licensee, kind: 'messenger' })
      await inboxRepository.create({ name: 'Vendas', licensee: otherLicensee, kind: 'messenger' })

      const inboxes = await inboxRepository.find({ licensee: licensee._id })

      expect(inboxes).toHaveLength(1)
      expect(inboxes[0].name).toEqual('Suporte')
    })
  })
})
