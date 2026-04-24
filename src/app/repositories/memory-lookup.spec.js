import { user as userFactory } from '@factories/user'
import { body as bodyFactory } from '@factories/body'
import { backgroundjob as backgroundjobFactory } from '@factories/backgroundjob'
import { integrationlog as integrationlogFactory } from '@factories/integrationlog'
import { triggerMultiProduct as triggerFactory } from '@factories/trigger'
import { LicenseeRepositoryMemory } from './licensee.js'
import { TemplateRepositoryMemory } from './template.js'
import { TriggerRepositoryMemory } from './trigger.js'
import { BodyRepositoryMemory } from './body.js'
import { BackgroundjobRepositoryMemory } from './backgroundjob.js'
import { UserRepositoryMemory } from './user.js'
import { IntegrationlogRepositoryMemory } from './integrationlog.js'

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

  it('saves body, backgroundjob and integrationlog documents', async () => {
    const licenseeRepository = new LicenseeRepositoryMemory()
    const bodyRepository = new BodyRepositoryMemory()
    const backgroundjobRepository = new BackgroundjobRepositoryMemory()
    const integrationlogRepository = new IntegrationlogRepositoryMemory()

    const licensee = await licenseeRepository.create({ name: 'Licensee', licenseKind: 'demo' })
    const body = await bodyRepository.create(bodyFactory.build({ licensee }))
    const backgroundjob = await backgroundjobRepository.create(backgroundjobFactory.build({ licensee }))
    const integrationlog = await integrationlogRepository.create(integrationlogFactory.build({ licensee }))

    body.concluded = true
    backgroundjob.status = 'running'
    integrationlog.log_description = 'Updated integration'

    await bodyRepository.save(body)
    await backgroundjobRepository.save(backgroundjob)
    await integrationlogRepository.save(integrationlog)

    expect(await bodyRepository.findFirst({ _id: body._id })).toEqual(expect.objectContaining({ concluded: true }))
    expect(await backgroundjobRepository.findFirst({ _id: backgroundjob._id })).toEqual(
      expect.objectContaining({ status: 'running' }),
    )
    expect(await integrationlogRepository.findFirst({ _id: integrationlog._id })).toEqual(
      expect.objectContaining({ log_description: 'Updated integration' }),
    )
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
