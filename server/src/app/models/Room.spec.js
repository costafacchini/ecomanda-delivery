const Licensee = require('@models/Licensee')
const Contact = require('@models/Contact')
const Room = require('@models/Room')
const mongoServer = require('../../../.jest/utils')

describe('Room', () => {
  beforeEach(async () => {
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('before save', () => {
    it('generates _id', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia', licenseKind: 'demo' })
      const contact = await Contact.create({
        number: '551190283745',
        talkingWithChatBot: false,
        licensee: licensee,
      })

      const room = await Room.create({ contact: contact })

      expect(room._id).not.toEqual(null)
    })

    it('does not changes _id if room is changed', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia', licenseKind: 'demo' })
      const contact = await Contact.create({
        number: '551190283745',
        talkingWithChatBot: false,
        licensee: licensee,
      })

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
