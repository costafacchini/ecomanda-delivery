import { user as userFactory } from '@factories/user'
import { body as bodyFactory } from '@factories/body'
import { triggerMultiProduct as triggerFactory } from '@factories/trigger'
import { LicenseeRepositoryMemory } from './licensee'
import { TemplateRepositoryMemory } from './template'
import { TriggerRepositoryMemory } from './trigger'
import { BodyRepositoryMemory } from './body'
import { UserRepositoryMemory } from './user'

describe('memory repositories - lookup entities', () => {
  it('orders triggers in memory and deletes templates by filter', async () => {
    const licenseeRepository = new LicenseeRepositoryMemory()
    const triggerRepository = new TriggerRepositoryMemory()
    const templateRepository = new TemplateRepositoryMemory()

    const licensee = await licenseeRepository.create({ name: 'Licensee', licenseKind: 'demo' })

    await triggerRepository.create(triggerFactory.build({ licensee, order: 2 }))
    await triggerRepository.create(triggerFactory.build({ licensee, order: 1 }))

    await templateRepository.create({ name: 'keep', namespace: 'a', licensee })
    await templateRepository.create({ name: 'remove', namespace: 'b', licensee })
    await templateRepository.delete({ name: 'remove' })

    const triggers = await triggerRepository.find({ licensee }, { order: 'asc' })

    expect(triggers[0].order).toEqual(1)
    expect(triggers[1].order).toEqual(2)
    expect(await templateRepository.find()).toEqual([expect.objectContaining({ name: 'keep' })])
  })

  it('saves body documents', async () => {
    const licenseeRepository = new LicenseeRepositoryMemory()
    const bodyRepository = new BodyRepositoryMemory()

    const licensee = await licenseeRepository.create({ name: 'Licensee', licenseKind: 'demo' })
    const body = await bodyRepository.create(bodyFactory.build({ licensee }))

    body.concluded = true

    await bodyRepository.save(body)

    expect(await bodyRepository.findFirst({ _id: body._id })).toEqual(expect.objectContaining({ concluded: true }))
  })

  it('hashes passwords and applies user projections in memory', async () => {
    const licenseeRepository = new LicenseeRepositoryMemory()
    const userRepository = new UserRepositoryMemory()

    const licensee = await licenseeRepository.create({ name: 'Licensee', licenseKind: 'demo' })
    const user = await userRepository.create(userFactory.build({ licensee }))

    expect(await user.validPassword('12345678')).toEqual(true)
    expect(await userRepository.find({}, { password: 0 })).toEqual([
      expect.not.objectContaining({ password: expect.anything() }),
    ])
  })
})
