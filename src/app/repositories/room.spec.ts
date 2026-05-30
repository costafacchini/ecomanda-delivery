import mongoServer from '../../../.jest/utils'
import Room from '@models/Room'
import { RoomRepositoryDatabase } from '@repositories/room'
import { licensee as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { ContactRepositoryDatabase } from '@repositories/contact'

describe('room repository', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#model', () => {
    it('returns a model', () => {
      const roomRepository = new RoomRepositoryDatabase()

      expect(roomRepository.model()).toEqual(Room)
    })
  })

  describe('#create', () => {
    it('creates a room', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(contactFactory.build({ licensee }))
      const roomRepository = new RoomRepositoryDatabase()

      const room = await roomRepository.create({
        contact,
      })

      expect(room).toEqual(
        expect.objectContaining({
          contact,
        }),
      )
    })
  })

  describe('#findFirst', () => {
    it('returns one record by filter', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(contactFactory.build({ licensee }))
      const roomRepository = new RoomRepositoryDatabase()

      await roomRepository.create({
        roomId: '1234',
        contact,
      })

      const anotherContact = await contactRepository.create(contactFactory.build({ licensee }))
      await roomRepository.create({
        roomId: '1234',
        contact: anotherContact,
      })

      const room = await roomRepository.findFirst({ roomId: '1234', contact: contact._id })

      expect(room).toEqual(
        expect.objectContaining({
          roomId: '1234',
          contact: expect.objectContaining({
            _id: contact._id,
          }),
        }),
      )

      expect(room.contact).not.toEqual(
        expect.objectContaining({
          contact: expect.objectContaining({
            _id: anotherContact._id,
          }),
        }),
      )
    })
  })

  describe('#save', () => {
    it('saves a room document', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(contactFactory.build({ licensee }))

      const roomRepository = new RoomRepositoryDatabase()
      const room = await roomRepository.create({
        roomId: '1234',
        contact,
      })

      room.closed = true
      await roomRepository.save(room)

      const roomSaved = await roomRepository.findFirst({ _id: room._id })
      expect(roomSaved.closed).toEqual(true)
    })
  })
})
