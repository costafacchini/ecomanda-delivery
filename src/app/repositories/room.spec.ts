import mongoServer from '../../../.jest/utils'
import Room from '@models/Room'
import { RoomRepositoryDatabase } from '@repositories/room'
import { licensee as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { sector as sectorFactory } from '@factories/sector'
import { user as userFactory } from '@factories/user'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { ContactRepositoryDatabase } from '@repositories/contact'
import { SectorRepositoryDatabase } from '@repositories/sector'
import { UserRepositoryDatabase } from '@repositories/user'

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

  describe('#findForAgent', () => {
    it('returns only rooms matching the provided sectorIds', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(contactFactory.build({ licensee }))

      const userRepository = new UserRepositoryDatabase()
      const user = await userRepository.create(userFactory.build({ licensee }))

      const sectorRepository = new SectorRepositoryDatabase()
      const sector = await sectorRepository.create(sectorFactory.build({ licensee, users: [user] }))
      const otherSector = await sectorRepository.create(sectorFactory.build({ licensee, users: [user] }))

      const roomRepository = new RoomRepositoryDatabase()
      await roomRepository.create({ contact, sector: sector })
      await roomRepository.create({ contact, sector: otherSector })

      const rooms = await roomRepository.findForAgent(null, licensee._id, [sector._id])

      expect(rooms.length).toEqual(1)
      expect(rooms[0].sector.toString()).toEqual(sector._id.toString())
    })

    it('returns all rooms when sectorIds is empty', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(contactFactory.build({ licensee }))

      const userRepository = new UserRepositoryDatabase()
      const user = await userRepository.create(userFactory.build({ licensee }))

      const sectorRepository = new SectorRepositoryDatabase()
      const sector = await sectorRepository.create(sectorFactory.build({ licensee, users: [user] }))

      const roomRepository = new RoomRepositoryDatabase()
      await roomRepository.create({ contact, sector: sector })
      await roomRepository.create({ contact })

      const rooms = await roomRepository.findForAgent(null, licensee._id, [])

      expect(rooms.length).toEqual(2)
    })
  })
})
