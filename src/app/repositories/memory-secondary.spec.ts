import { licensee as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { RoomRepositoryMemory } from './room'
import { LicenseeRepositoryMemory } from './licensee'
import { ContactRepositoryMemory } from './contact'

describe('memory repositories - secondary entities', () => {
  it('saves rooms and finds them by contact id', async () => {
    const licenseeRepository = new LicenseeRepositoryMemory()
    const contactRepository = new ContactRepositoryMemory()
    const roomRepository = new RoomRepositoryMemory()

    const licensee = await licenseeRepository.create(licenseeFactory.build())
    const contact = await contactRepository.create(contactFactory.build({ licensee }))
    const room = await roomRepository.create({ roomId: 'room-1', contact })

    room.closed = true
    await roomRepository.save(room)

    expect(await roomRepository.findFirst({ contact: contact._id })).toEqual(
      expect.objectContaining({ roomId: 'room-1', closed: true }),
    )
  })
})
