import TriggersQuery from '@queries/TriggersQuery'
import mongoServer from '../../../.jest/utils'
import Trigger from '@models/Trigger'
import { licensee as licenseeFactory } from '@factories/licensee'
import {
  triggerMultiProduct as triggerMultiProductFactory,
  triggerSingleProduct as triggerSingleProductFactory,
  triggerReplyButton as triggerReplyButtonFactory,
  triggerListMessage as triggerListMessageFactory,
  triggerText as triggerTextFactory,
} from '@factories/trigger'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'

describe('TriggersQuery', () => {
  let licensee

  beforeEach(async () => {
    await mongoServer.connect()

    const licenseeRepository = new LicenseeRepositoryDatabase()
    licensee = await licenseeRepository.create(licenseeFactory.build())
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('returns all triggers ordered by createdAt asc', async () => {
    const trigger1 = await Trigger.create(
      triggerMultiProductFactory.build({ licensee, createdAt: new Date(2021, 6, 3, 0, 0, 0) }),
    )
    const trigger2 = await Trigger.create(
      triggerMultiProductFactory.build({ licensee, createdAt: new Date(2021, 6, 3, 0, 0, 1) }),
    )

    const triggersQuery = new TriggersQuery()
    const records = await triggersQuery.all()

    expect(records.length).toEqual(2)
    expect(records[0]).toEqual(expect.objectContaining({ _id: trigger1._id }))
    expect(records[1]).toEqual(expect.objectContaining({ _id: trigger2._id }))
  })

  describe('about pagination', () => {
    it('returns all by page respecting the limit', async () => {
      const trigger1 = await Trigger.create(
        triggerMultiProductFactory.build({
          licensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 0),
        }),
      )
      const trigger2 = await Trigger.create(
        triggerSingleProductFactory.build({
          licensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 1),
        }),
      )
      const trigger3 = await Trigger.create(
        triggerReplyButtonFactory.build({
          licensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 2),
        }),
      )

      const triggersQuery = new TriggersQuery()
      triggersQuery.page(1)
      triggersQuery.limit(2)

      let records = await triggersQuery.all()

      expect(records.length).toEqual(2)
      expect(records[0]).toEqual(expect.objectContaining({ _id: trigger1._id }))
      expect(records[1]).toEqual(expect.objectContaining({ _id: trigger2._id }))

      triggersQuery.page(2)
      records = await triggersQuery.all()

      expect(records.length).toEqual(1)
      expect(records[0]).toEqual(expect.objectContaining({ _id: trigger3._id }))

      triggersQuery.page(1)
      triggersQuery.limit(1)

      records = await triggersQuery.all()

      expect(records.length).toEqual(1)
      expect(records[0]).toEqual(expect.objectContaining({ _id: trigger1._id }))
    })
  })

  describe('filterByKind', () => {
    it('returns triggers filtered by trigger kind', async () => {
      const trigger1 = await Trigger.create(
        triggerMultiProductFactory.build({ licensee, createdAt: new Date(2021, 6, 3, 0, 0, 0) }),
      )
      const trigger2 = await Trigger.create(
        triggerSingleProductFactory.build({ licensee, createdAt: new Date(2021, 6, 3, 0, 0, 1) }),
      )
      const trigger3 = await Trigger.create(
        triggerReplyButtonFactory.build({ licensee, createdAt: new Date(2021, 6, 3, 0, 0, 1) }),
      )
      const trigger4 = await Trigger.create(
        triggerListMessageFactory.build({ licensee, createdAt: new Date(2021, 6, 3, 0, 0, 1) }),
      )
      const trigger5 = await Trigger.create(
        triggerTextFactory.build({ licensee, createdAt: new Date(2021, 6, 3, 0, 0, 1) }),
      )

      const triggersQuery = new TriggersQuery()
      triggersQuery.filterByKind('multi_product')
      let records = await triggersQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger1._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger2._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger3._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger4._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger5._id })]))

      triggersQuery.filterByKind('single_product')
      records = await triggersQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger2._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger1._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger3._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger4._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger5._id })]))

      triggersQuery.filterByKind('reply_button')
      records = await triggersQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger3._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger1._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger2._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger4._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger5._id })]))

      triggersQuery.filterByKind('list_message')
      records = await triggersQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger4._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger1._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger2._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger3._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger5._id })]))

      triggersQuery.filterByKind('text')
      records = await triggersQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger5._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger1._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger2._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger3._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger4._id })]))
    })
  })

  describe('filterByLicensee', () => {
    it('returns triggers filtered by licensee', async () => {
      const trigger1 = await Trigger.create(
        triggerMultiProductFactory.build({ licensee, createdAt: new Date(2021, 6, 3, 0, 0, 0) }),
      )

      const licenseeRepository = new LicenseeRepositoryDatabase()
      const anotherLicensee = await licenseeRepository.create(licenseeFactory.build({ name: 'Wolf e cia' }))
      const trigger2 = await Trigger.create(
        triggerMultiProductFactory.build({ licensee: anotherLicensee._id, createdAt: new Date(2021, 6, 3, 0, 0, 1) }),
      )

      const triggersQuery = new TriggersQuery()
      triggersQuery.filterByLicensee(licensee._id)

      const records = await triggersQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger1._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger2._id })]))
    })
  })

  describe('filterByExpression', () => {
    it('returns licensees filtered by expression on name, expression, catalogMulti, catalogSingle, textReplyButton and messagesList', async () => {
      const trigger1 = await Trigger.create(triggerMultiProductFactory.build({ name: 'trigger1', licensee }))
      const trigger2 = await Trigger.create(triggerSingleProductFactory.build({ expression: 'trigger2', licensee }))
      const trigger3 = await Trigger.create(triggerMultiProductFactory.build({ catalogMulti: 'trigger3', licensee }))
      const trigger4 = await Trigger.create(triggerReplyButtonFactory.build({ catalogSingle: 'trigger4', licensee }))
      const trigger5 = await Trigger.create(triggerSingleProductFactory.build({ catalogSingle: 'trigger5', licensee }))
      const trigger6 = await Trigger.create(triggerReplyButtonFactory.build({ textReplyButton: 'trigger6', licensee }))
      const trigger7 = await Trigger.create(triggerListMessageFactory.build({ messagesList: 'trigger7', licensee }))
      const trigger8 = await Trigger.create(triggerTextFactory.build({ text: 'trigger8', licensee }))

      const triggersQuery = new TriggersQuery()
      triggersQuery.filterByExpression('trigger')
      let records = await triggersQuery.all()

      expect(records.length).toEqual(8)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger1._id })]))
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger2._id })]))
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger3._id })]))
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger4._id })]))
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger5._id })]))
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger6._id })]))
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger7._id })]))
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger8._id })]))

      triggersQuery.filterByExpression('trigger1')
      records = await triggersQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger1._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger2._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger3._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger4._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger5._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger6._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger7._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger8._id })]))

      triggersQuery.filterByExpression('trigger2')
      records = await triggersQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger2._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger1._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger3._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger4._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger5._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger6._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger7._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger8._id })]))

      triggersQuery.filterByExpression('trigger3')
      records = await triggersQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger3._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger1._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger2._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger4._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger5._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger6._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger7._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger8._id })]))

      triggersQuery.filterByExpression('trigger4')
      records = await triggersQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger4._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger1._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger2._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger3._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger5._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger6._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger7._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger8._id })]))

      triggersQuery.filterByExpression('trigger5')
      records = await triggersQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger5._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger1._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger2._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger3._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger4._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger6._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger7._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger8._id })]))

      triggersQuery.filterByExpression('trigger6')
      records = await triggersQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger6._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger1._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger2._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger3._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger4._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger5._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger7._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger8._id })]))

      triggersQuery.filterByExpression('trigger7')
      records = await triggersQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger7._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger1._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger2._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger3._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger4._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger5._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger6._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger8._id })]))

      triggersQuery.filterByExpression('trigger8')
      records = await triggersQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger8._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger1._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger2._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger3._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger4._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger5._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger6._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: trigger7._id })]))
    })
  })
})
