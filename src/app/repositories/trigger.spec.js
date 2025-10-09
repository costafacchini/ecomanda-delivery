import mongoServer from '../../../.jest/utils.js'
import { createTrigger, getAllTriggerBy  } from '@repositories/trigger.js'
import { licensee as licenseeFactory   } from '@factories/licensee.js'
import { triggerMultiProduct as triggerFactory   } from '@factories/trigger.js'
import { LicenseeRepositoryDatabase  } from '@repositories/licensee.js'

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

      const trigger = await createTrigger({
        licensee,
        name: 'Send multi products',
        expression: 'send_multi_product',
        triggerKind: 'multi_product',
        catalogMulti: 'catalog',
        catalogId: 'id',
        order: 1,
      })

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
      const trigger1 = await createTrigger(triggerFactory.build({ licensee }))
      const trigger2 = await createTrigger(triggerFactory.build({ licensee }))

      const anotherLicensee = await licenseeRepository.create(licenseeFactory.build())
      const trigger3 = await createTrigger(triggerFactory.build({ licensee: anotherLicensee }))

      const triggers = await getAllTriggerBy({ licensee })
      expect(triggers.length).toEqual(2)
      expect(triggers).toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger1._id })]))
      expect(triggers).toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger2._id })]))
      expect(triggers).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger3._id })]))
    })

    it('returns all records by filter ordered', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())
      const trigger1 = await createTrigger(triggerFactory.build({ licensee, order: 2 }))
      const trigger2 = await createTrigger(triggerFactory.build({ licensee, order: 1 }))

      const triggers = await getAllTriggerBy({ licensee }, { order: 'asc' })
      expect(triggers.length).toEqual(2)
      expect(triggers[0]).toEqual(expect.objectContaining({ _id: trigger2._id }))
      expect(triggers[1]).toEqual(expect.objectContaining({ _id: trigger1._id }))
    })
  })
})
