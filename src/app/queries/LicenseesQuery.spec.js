const LicenseesQuery = require('@queries/LicenseesQuery')
const mongoServer = require('../../../.jest/utils')
const Licensee = require('@models/Licensee')

describe('LicenseesQuery', () => {
  beforeEach(async () => {
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('returns all licensees ordered by createdAt asc', async () => {
    const licensee1 = await Licensee.create({
      name: 'Alcateia',
      licenseKind: 'demo',
      createdAt: new Date(2021, 6, 3, 0, 0, 0),
    })
    const licensee2 = await Licensee.create({
      name: 'Alcateia',
      licenseKind: 'demo',
      createdAt: new Date(2021, 6, 3, 0, 0, 1),
    })

    const licenseesQuery = new LicenseesQuery()
    const records = await licenseesQuery.all()

    expect(records.length).toEqual(2)
    expect(records[0]).toEqual(expect.objectContaining({ _id: licensee1._id }))
    expect(records[1]).toEqual(expect.objectContaining({ _id: licensee2._id }))
  })

  describe('about pagination', () => {
    it('returns all by page respecting the limit', async () => {
      const licensee1 = await Licensee.create({
        name: 'Alcateia',
        licenseKind: 'demo',
        createdAt: new Date(2021, 6, 3, 0, 0, 0),
      })
      const licensee2 = await Licensee.create({
        name: 'Alcateia',
        licenseKind: 'demo',
        createdAt: new Date(2021, 6, 3, 0, 0, 1),
      })
      const licensee3 = await Licensee.create({
        name: 'Alcateia',
        licenseKind: 'demo',
        createdAt: new Date(2021, 6, 3, 0, 0, 2),
      })

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
      const licensee1 = await Licensee.create({
        name: 'Alcateia',
        licenseKind: 'demo',
        chatDefault: 'jivochat',
        chatUrl: 'http://chat.com',
        chatKey: 'key',
      })
      const licensee2 = await Licensee.create({
        name: 'Alcateia',
        licenseKind: 'demo',
        chatDefault: 'rocketchat',
        chatUrl: 'http://chat.com',
        chatKey: 'key',
      })

      const licenseesQuery = new LicenseesQuery()
      licenseesQuery.filterByChatDefault('jivochat')
      const records = await licenseesQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: licensee1._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: licensee2._id })]))
    })
  })

  describe('filterByChatbotDefault', () => {
    it('returns licensees filtered by chatbot default', async () => {
      const licensee1 = await Licensee.create({
        name: 'Alcateia',
        licenseKind: 'demo',
        useChatbot: true,
        chatbotDefault: 'landbot',
        chatbotUrl: 'http://chat.com',
        chatbotAuthorizationToken: 'key',
      })
      const licensee2 = await Licensee.create({
        name: 'Alcateia',
        licenseKind: 'demo',
        useChatbot: false,
      })

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
      const licensee1 = await Licensee.create({
        name: 'Alcateia',
        licenseKind: 'demo',
        whatsappDefault: 'dialog',
        whatsappUrl: 'http://whats.com',
        whatsappToken: 'key',
      })
      const licensee2 = await Licensee.create({
        name: 'Alcateia',
        licenseKind: 'demo',
        whatsappDefault: 'chatapi',
        whatsappUrl: 'http://whats.com',
        whatsappToken: 'key',
      })

      const licenseesQuery = new LicenseesQuery()
      licenseesQuery.filterByWhatsappDefault('dialog')
      const records = await licenseesQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: licensee1._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: licensee2._id })]))
    })
  })

  describe('filterByExpression', () => {
    it('returns licensees filtered by expression on name, email and phone', async () => {
      const licensee1 = await Licensee.create({
        name: 'Alcateia',
        email: 'alcateia@gmail.com',
        phone: '551123459',
        licenseKind: 'demo',
      })
      const licensee2 = await Licensee.create({
        name: 'Doeland',
        email: 'doeland@china.com',
        phone: '56009234687',
        licenseKind: 'demo',
      })
      const licensee3 = await Licensee.create({
        name: 'Mary Ltda',
        email: 'maryltda@china.com',
        phone: '457654635',
        licenseKind: 'demo',
      })

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
})
