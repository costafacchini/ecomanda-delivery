const Licensee = require('@models/Licensee')
const Contact = require('@models/Contact')
const mongoServer = require('../../../.jest/utils')
const { createRoom, getRoomBy } = require('@repositories/room')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')

describe('room repository', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#createRoom', () => {
    it('creates a room', async () => {
      const licensee = await Licensee.create(licenseeFactory.build())
      const contact = await Contact.create(contactFactory.build({ licensee }))

      const room = await createRoom({
        contact,
      })

      expect(room).toEqual(
        expect.objectContaining({
          contact,
        })
      )
    })
  })

  describe('#getRoomBy', () => {
    it('returns one record by filter', async () => {
      const licensee = await Licensee.create(licenseeFactory.build())
      const contact = await Contact.create(contactFactory.build({ licensee }))

      await createRoom({
        roomId: '1234',
        contact,
      })

      const anotherContact = await Contact.create(contactFactory.build({ licensee }))
      await createRoom({
        roomId: '1234',
        contact: anotherContact,
      })

      const room = await getRoomBy({ roomId: '1234', contact: contact._id })

      expect(room).toEqual(
        expect.objectContaining({
          roomId: '1234',
          contact: contact._id,
        })
      )

      expect(contact).not.toEqual(
        expect.objectContaining({
          contact: anotherContact._id,
        })
      )
    })
  })
})
