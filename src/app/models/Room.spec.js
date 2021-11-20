const Licensee = require('@models/Licensee')
const Contact = require('@models/Contact')
const Room = require('@models/Room')
const mongoServer = require('../../../.jest/utils')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')

describe('Room', () => {
  let contact

  beforeEach(async () => {
    await mongoServer.connect()

    const licensee = await Licensee.create(licenseeFactory.build())
    contact = await Contact.create(contactFactory.build({ licensee }))
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('before save', () => {
    it('generates _id', async () => {
      const room = await Room.create({ contact })

      expect(room._id).not.toEqual(null)
    })

    it('does not changes _id if room is changed', async () => {
      const room = await Room.create({ roomId: 'acb0134', contact: contact })

      room.roomId = 'Changed'
      const alteredRoom = await room.save()

      expect(room._id).toEqual(alteredRoom._id)
      expect(alteredRoom.roomId).toEqual('Changed')
    })

    it('fills the fields that have a default value', () => {
      const room = new Room()

      expect(room.closed).toEqual(false)
    })
  })

  describe('validations', () => {
    describe('contact', () => {
      it('is required', () => {
        const room = new Room({})
        const validation = room.validateSync()

        expect(validation.errors['contact'].message).toEqual('Contato: Você deve preencher o campo')
      })
    })
  })
})
