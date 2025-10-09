import mongoServer from '../../../.jest/utils.js'
import { createRoom, getRoomBy  } from '@repositories/room.js'
import { licensee as licenseeFactory   } from '@factories/licensee.js'
import { contact as contactFactory   } from '@factories/contact.js'
import { LicenseeRepositoryDatabase  } from '@repositories/licensee.js'
import { ContactRepositoryDatabase  } from '@repositories/contact.js'

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
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(contactFactory.build({ licensee }))

      const room = await createRoom({
        contact,
      })

      expect(room).toEqual(
        expect.objectContaining({
          contact,
        }),
      )
    })
  })

  describe('#getRoomBy', () => {
    it('returns one record by filter', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(contactFactory.build({ licensee }))

      await createRoom({
        roomId: '1234',
        contact,
      })

      const anotherContact = await contactRepository.create(contactFactory.build({ licensee }))
      await createRoom({
        roomId: '1234',
        contact: anotherContact,
      })

      const room = await getRoomBy({ roomId: '1234', contact: contact._id })

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
})
