const Licensee = require('@models/Licensee')
const Contact = require('@models/Contact')
const mongoServer = require('../../../../../.jest/utils')
const importRoom = require('./importRoom')

describe('importRoom', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('import room', async () => {
    const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })
    const contact = await Contact.create({
      name: 'John Doe',
      number: '5593165392832',
      type: '@c.us',
      talkingWithChatBot: false,
      licensee: licensee,
    })

    const room = 'pwNsgcQL8sbTcser'

    const response = await importRoom(room, contact)

    expect(response.success).toEqual(true)
    expect(response.room.roomId).toEqual(room)
    expect(response.room.token).toEqual('5593165392832@c.us')
    expect(response.room.contact._id).toEqual(contact._id)
  })

  it('does not import if room is blank', async () => {
    const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })
    const contact = await Contact.create({
      name: 'John Doe',
      number: '5593165392832',
      type: '@c.us',
      talkingWithChatBot: false,
      licensee: licensee,
    })

    const room = ''

    const response = await importRoom(room, contact)

    expect(response.success).toEqual(false)
  })

  it('does not import if room is not defined', async () => {
    const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })
    const contact = await Contact.create({
      name: 'John Doe',
      number: '5593165392832',
      type: '@c.us',
      talkingWithChatBot: false,
      licensee: licensee,
    })

    const room = undefined

    const response = await importRoom(room, contact)

    expect(response.success).toEqual(false)
  })

  it('returns error if room is invalid', async () => {
    const contact = { _id: 'invalid' }

    const room = 'pwNsgcQL8sbTcser'

    const response = await importRoom(room, contact)

    expect(response.success).toEqual(false)
    expect(response.error).toMatch(/Room não importada/)
    expect(response.error).toMatch(/Cast to ObjectId failed for value/)
  })
})
