import mongoServer from '../../../.jest/utils'
import { createTrigger, getAllTriggerBy } from '@repositories/trigger'
import { licensee as licenseeFactory } from '@factories/licensee'
import { triggerMultiProduct as triggerFactory } from '@factories/trigger'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { TriggerRepositoryDatabase } from '@repositories/trigger'

describe('trigger repository', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#createTrigger', () => {
    it('creates a trigger', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())
      const triggerRepository = new TriggerRepositoryDatabase()

      const trigger = await createTrigger(
        {
          licensee,
          name: 'Send multi products',
          expression: 'send_multi_product',
          triggerKind: 'multi_product',
          catalogMulti: 'catalog',
          catalogId: 'id',
          order: 1,
        },
        {
          triggerRepository,
        },
      )

      expect(trigger).toEqual(
        expect.objectContaining({
          name: 'Send multi products',
          expression: 'send_multi_product',
          triggerKind: 'multi_product',
          catalogMulti: 'catalog',
          catalogId: 'id',
          order: 1,
          licensee,
        }),
      )
    })
  })

  describe('#getAllTriggerBy', () => {
    it('returns all records by filter', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())
      const triggerRepository = new TriggerRepositoryDatabase()
      const trigger1 = await createTrigger(triggerFactory.build({ licensee }), {
        triggerRepository,
      })
      const trigger2 = await createTrigger(triggerFactory.build({ licensee }), {
        triggerRepository,
      })

      const anotherLicensee = await licenseeRepository.create(licenseeFactory.build())
      const trigger3 = await createTrigger(triggerFactory.build({ licensee: anotherLicensee }), {
        triggerRepository,
      })

      const triggers = await getAllTriggerBy({ licensee }, {}, { triggerRepository })
      expect(triggers.length).toEqual(2)
      expect(triggers).toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger1._id })]))
      expect(triggers).toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger2._id })]))
      expect(triggers).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger3._id })]))
    })

    it('returns all records by filter ordered', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())
      const triggerRepository = new TriggerRepositoryDatabase()
      const trigger1 = await createTrigger(triggerFactory.build({ licensee, order: 2 }), {
        triggerRepository,
      })
      const trigger2 = await createTrigger(triggerFactory.build({ licensee, order: 1 }), {
        triggerRepository,
      })

      const triggers = await getAllTriggerBy({ licensee }, { order: 'asc' }, { triggerRepository })
      expect(triggers.length).toEqual(2)
      expect(triggers[0]).toEqual(expect.objectContaining({ _id: trigger2._id }))
      expect(triggers[1]).toEqual(expect.objectContaining({ _id: trigger1._id }))
    })
  })
})
