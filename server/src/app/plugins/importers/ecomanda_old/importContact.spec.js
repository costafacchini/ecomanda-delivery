const Licensee = require('@models/Licensee')
const Contact = require('@models/Contact')
const mongoServer = require('../../../../../.jest/utils')
const importContact = require('./importContact')

describe('importContact', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('import contact', async () => {
    const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

    const chatRef = '5519852739463@g.us'
    const name = 'Family group'
    const chatBot = 'chat'

    const response = await importContact(chatRef, name, chatBot, licensee)

    expect(response.success).toEqual(true)
    expect(response.contact.name).toEqual('Family group')
    expect(response.contact.number).toEqual('5519852739463')
    expect(response.contact.type).toEqual('@g.us')
    expect(response.contact.talkingWithChatBot).toEqual(false)
    expect(response.contact.licensee._id).toEqual(licensee._id)
  })

  it('does not import neither update contact if already exists', async () => {
    const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })
    const contact = await Contact.create({
      name: 'John Doe',
      number: '5593165392832@c.us',
      type: '@c.us',
      talkingWithChatBot: false,
      licensee: licensee,
    })

    const chatRef = '5593165392832@c.us'

    const response = await importContact(chatRef, '', '', licensee)

    expect(response.success).toEqual(true)
    expect(response.contact._id).toEqual(contact._id)
    expect(response.contact.name).toEqual('John Doe')
    expect(response.contact.number).toEqual('5593165392832')
    expect(response.contact.type).toEqual('@c.us')
    expect(response.contact.talkingWithChatBot).toEqual(false)
    expect(response.contact.licensee._id).toEqual(licensee._id)
  })

  it('returns error if contact is invalid', async () => {
    const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

    const chatRef = ''
    const name = 'Withou number'
    const chatBot = 'chat'

    const response = await importContact(chatRef, name, chatBot, licensee)

    expect(response.success).toEqual(false)
    expect(response.error).toMatch(/Contato não importado/)
    expect(response.error).toMatch(/Numero: Você deve preencher o campo/)
  })

  describe('about talkingWithChatBot', () => {
    it('is true when chatBot is not chat', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const chatRef = '5519852739463@g.us'
      const chatBot = 'landbot'

      const response = await importContact(chatRef, '', chatBot, licensee)

      expect(response.success).toEqual(true)
      expect(response.contact.talkingWithChatBot).toEqual(true)
      expect(response.contact.number).toEqual('5519852739463')
      expect(response.contact.type).toEqual('@g.us')
      expect(response.contact.licensee._id).toEqual(licensee._id)
    })

    it('is false when chatBot is chat', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const chatRef = '5519852739463@g.us'
      const chatBot = 'chat'

      const response = await importContact(chatRef, '', chatBot, licensee)

      expect(response.success).toEqual(true)
      expect(response.contact.talkingWithChatBot).toEqual(false)
      expect(response.contact.number).toEqual('5519852739463')
      expect(response.contact.type).toEqual('@g.us')
      expect(response.contact.licensee._id).toEqual(licensee._id)
    })
  })
})
