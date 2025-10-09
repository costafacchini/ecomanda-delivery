import LicenseesQuery from '@queries/LicenseesQuery.js'
import mongoServer from '../../../.jest/utils.js'
import { licensee as licenseeFactory   } from '@factories/licensee.js'
import { LicenseeRepositoryDatabase  } from '@repositories/licensee.js'

describe('LicenseesQuery', () => {
  beforeEach(async () => {
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('returns all licensees ordered by createdAt asc', async () => {
    const licenseeRepository = new LicenseeRepositoryDatabase()
    const licensee1 = await licenseeRepository.create(
      licenseeFactory.build({
        createdAt: new Date(2021, 6, 3, 0, 0, 0),
      }),
    )
    const licensee2 = await licenseeRepository.create(
      licenseeFactory.build({
        createdAt: new Date(2021, 6, 3, 0, 0, 1),
      }),
    )

    const licenseesQuery = new LicenseesQuery()
    const records = await licenseesQuery.all()

    expect(records.length).toEqual(2)
    expect(records[0]).toEqual(expect.objectContaining({ _id: licensee1._id }))
    expect(records[1]).toEqual(expect.objectContaining({ _id: licensee2._id }))
  })

  describe('about pagination', () => {
    it('returns all by page respecting the limit', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee1 = await licenseeRepository.create(
        licenseeFactory.build({
          createdAt: new Date(2021, 6, 3, 0, 0, 0),
        }),
      )
      const licensee2 = await licenseeRepository.create(
        licenseeFactory.build({
          createdAt: new Date(2021, 6, 3, 0, 0, 1),
        }),
      )
      const licensee3 = await licenseeRepository.create(
        licenseeFactory.build({
          createdAt: new Date(2021, 6, 3, 0, 0, 2),
        }),
      )

      const licenseesQuery = new LicenseesQuery()
      licenseesQuery.page(1)
      licenseesQuery.limit(2)

      let records = await licenseesQuery.all()

      expect(records.length).toEqual(2)
      expect(records[0]).toEqual(expect.objectContaining({ _id: licensee1._id }))
      expect(records[1]).toEqual(expect.objectContaining({ _id: licensee2._id }))

      licenseesQuery.page(2)
      records = await licenseesQuery.all()

      expect(records.length).toEqual(1)
      expect(records[0]).toEqual(expect.objectContaining({ _id: licensee3._id }))

      licenseesQuery.page(1)
      licenseesQuery.limit(1)

      records = await licenseesQuery.all()

      expect(records.length).toEqual(1)
      expect(records[0]).toEqual(expect.objectContaining({ _id: licensee1._id }))
    })
  })

  describe('filterByChatDefault', () => {
    it('returns licensees filtered by chat default', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee1 = await licenseeRepository.create(
        licenseeFactory.build({
          chatDefault: 'crisp',
          chatUrl: 'http://chat.com',
          chatKey: 'key',
          chatIdentifier: 'identifier',
        }),
      )
      const licensee2 = await licenseeRepository.create(
        licenseeFactory.build({
          chatDefault: 'rocketchat',
          chatUrl: 'http://chat.com',
          chatKey: 'key',
        }),
      )

      const licenseesQuery = new LicenseesQuery()
      licenseesQuery.filterByChatDefault('crisp')
      const records = await licenseesQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: licensee1._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: licensee2._id })]))
    })
  })

  describe('filterByChatbotDefault', () => {
    it('returns licensees filtered by chatbot default', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee1 = await licenseeRepository.create(
        licenseeFactory.build({
          useChatbot: true,
          chatbotDefault: 'landbot',
          chatbotUrl: 'http://chat.com',
          chatbotAuthorizationToken: 'key',
        }),
      )
      const licensee2 = await licenseeRepository.create(
        licenseeFactory.build({
          useChatbot: false,
        }),
      )

      const licenseesQuery = new LicenseesQuery()
      licenseesQuery.filterByChatbotDefault('landbot')
      const records = await licenseesQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: licensee1._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: licensee2._id })]))
    })
  })

  describe('filterByWhatsappDefault', () => {
    it('returns licensees filtered by whatsapp default', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee1 = await licenseeRepository.create(
        licenseeFactory.build({
          whatsappDefault: 'utalk',
          whatsappUrl: 'https://v1.utalk.chat/send/',
          whatsappToken: 'key',
          bucketName: 'bucket',
          awsId: 'id',
          awsSecret: 'secret',
        }),
      )
      const licensee2 = await licenseeRepository.create(
        licenseeFactory.build({
          whatsappDefault: 'dialog',
          whatsappUrl: 'https://waba.360dialog.io/',
          whatsappToken: 'key',
        }),
      )

      const licenseesQuery = new LicenseesQuery()
      licenseesQuery.filterByWhatsappDefault('utalk')
      const records = await licenseesQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: licensee1._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: licensee2._id })]))
    })
  })

  describe('filterByExpression', () => {
    it('returns licensees filtered by expression on name, email and phone', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee1 = await licenseeRepository.create(
        licenseeFactory.build({
          email: 'alcateia@gmail.com',
          phone: '551123459',
        }),
      )
      const licensee2 = await licenseeRepository.create(
        licenseeFactory.build({
          name: 'Doeland',
          email: 'doeland@china.com',
          phone: '56009234687',
        }),
      )
      const licensee3 = await licenseeRepository.create(
        licenseeFactory.build({
          name: 'Mary Ltda',
          email: 'maryltda@china.com',
          phone: '457654635',
        }),
      )

      const licenseesQuery = new LicenseesQuery()
      licenseesQuery.filterByExpression('Alcateia 56')
      let records = await licenseesQuery.all()

      expect(records.length).toEqual(2)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: licensee1._id })]))
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: licensee2._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: licensee3._id })]))

      licenseesQuery.filterByExpression('CHINA')
      records = await licenseesQuery.all()

      expect(records.length).toEqual(2)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: licensee2._id })]))
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: licensee3._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: licensee1._id })]))
    })
  })

  describe('filterByActive', () => {
    it('returns only active licensees', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee1 = await licenseeRepository.create(licenseeFactory.build())
      const licenseeInactive = await licenseeRepository.create(licenseeFactory.build({ active: false }))

      const licenseesQuery = new LicenseesQuery()
      licenseesQuery.filterByActive()
      const records = await licenseesQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: licensee1._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: licenseeInactive._id })]))
    })
  })

  describe('filterByPedidos10Active', () => {
    it('returns licensees filtered by pedidos10_active', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee1 = await licenseeRepository.create(licenseeFactory.build({ pedidos10_active: true }))
      const licenseeInactive = await licenseeRepository.create(licenseeFactory.build({ pedidos10_active: false }))

      const licenseesQuery = new LicenseesQuery()
      licenseesQuery.filterByPedidos10Active('true')
      let records = await licenseesQuery.all()

      // When filter is true, join other licensees plus pedidos 10 licensees
      expect(records.length).toEqual(2)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: licensee1._id })]))
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: licenseeInactive._id })]))

      licenseesQuery.filterByPedidos10Active('false')
      records = await licenseesQuery.all()

      expect(records.length).toEqual(1)
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: licensee1._id })]))
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: licenseeInactive._id })]))
    })
  })
})
