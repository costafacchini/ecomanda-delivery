import Room from '@models/Room'
import mongoServer from '../../../.jest/utils'
import { licensee as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { ContactRepositoryDatabase } from '@repositories/contact'

describe('Room', () => {
  let contact

  beforeEach(async () => {
    await mongoServer.connect()

    const licenseeRepository = new LicenseeRepositoryDatabase()
    const licensee = await licenseeRepository.create(licenseeFactory.build())

    const contactRepository = new ContactRepositoryDatabase()
    contact = await contactRepository.create(contactFactory.build({ licensee }))
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
      expect(room.status).toEqual('pending')
      expect(room.agent).toEqual(null)
    })

    describe('status → closed sync', () => {
      it('setting status to closed syncs closed=true and sets closedAt', async () => {
        const room = await Room.create({ contact })
        room.status = 'closed'
        await room.save()

        expect(room.closed).toEqual(true)
        expect(room.closedAt).toBeDefined()
      })

      it('setting status to open syncs closed=false and clears closedAt', async () => {
        const room = await Room.create({ contact, closed: true, closedAt: new Date() })
        room.status = 'open'
        await room.save()

        expect(room.closed).toEqual(false)
        expect(room.closedAt).toBeUndefined()
      })

      it('setting status to pending syncs closed=false', async () => {
        const room = await Room.create({ contact, closed: true, closedAt: new Date() })
        room.status = 'pending'
        await room.save()

        expect(room.closed).toEqual(false)
      })
    })

    describe('closed → status sync (legacy path)', () => {
      it('setting closed=true syncs status to closed', async () => {
        const room = await Room.create({ contact })
        room.closed = true
        await room.save()

        expect(room.status).toEqual('closed')
      })

      it('setting closed=false syncs status to open', async () => {
        const room = await Room.create({ contact, closed: true, closedAt: new Date(), status: 'closed' })
        room.closed = false
        await room.save()

        expect(room.status).toEqual('open')
      })
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
