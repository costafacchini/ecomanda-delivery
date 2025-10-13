import { TemplatesQuery } from '@queries/TemplatesQuery'
import mongoServer from '../../../.jest/utils'
import Template from '@models/Template'
import { licensee as licenseeFactory } from '@factories/licensee'
import { template as templateFactory } from '@factories/template'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'

describe('TemplatesQuery', () => {
  let licensee

  beforeEach(async () => {
    await mongoServer.connect()

    const licenseeRepository = new LicenseeRepositoryDatabase()
    licensee = await licenseeRepository.create(licenseeFactory.build())
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('returns all templates ordered by createdAt asc', async () => {
    const template1 = await Template.create(
      templateFactory.build({ licensee, createdAt: new Date(2021, 6, 3, 0, 0, 0) }),
    )
    const template2 = await Template.create(
      templateFactory.build({ licensee, createdAt: new Date(2021, 6, 3, 0, 0, 1) }),
    )

    const templatesQuery = new TemplatesQuery()
    const records = await templatesQuery.all()

    expect(records.length).toEqual(2)
    expect(records[0]).toEqual(expect.objectContaining({ _id: template1._id }))
    expect(records[1]).toEqual(expect.objectContaining({ _id: template2._id }))
  })

  describe('about pagination', () => {
    it('returns all by page respecting the limit', async () => {
      const template1 = await Template.create(
        templateFactory.build({
          licensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 0),
        }),
      )
      const template2 = await Template.create(
        templateFactory.build({
          licensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 1),
        }),
      )
      const template3 = await Template.create(
        templateFactory.build({
          licensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 2),
        }),
      )

      const templatesQuery = new TemplatesQuery()
      templatesQuery.page(1)
      templatesQuery.limit(2)

      let records = await templatesQuery.all()

      expect(records.length).toEqual(2)
      expect(records[0]).toEqual(expect.objectContaining({ _id: template1._id }))
      expect(records[1]).toEqual(expect.objectContaining({ _id: template2._id }))

      templatesQuery.page(2)
      records = await templatesQuery.all()

      expect(records.length).toEqual(1)
      expect(records[0]).toEqual(expect.objectContaining({ _id: template3._id }))

      templatesQuery.page(1)
      templatesQuery.limit(1)

      records = await templatesQuery.all()

      expect(records.length).toEqual(1)
      expect(records[0]).toEqual(expect.objectContaining({ _id: template1._id }))
    })
  })

  describe('filterByLicensee', () => {
    it('returns templates filtered by licensee', async () => {
      const template1 = await Template.create(
        templateFactory.build({ licensee, createdAt: new Date(2021, 6, 3, 0, 0, 0) }),
      )

      const licenseeRepository = new LicenseeRepositoryDatabase()
      const anotherLicensee = await licenseeRepository.create(licenseeFactory.build({ name: 'Wolf e cia' }))
      const template2 = await Template.create(
        templateFactory.build({ licensee: anotherLicensee._id, createdAt: new Date(2021, 6, 3, 0, 0, 1) }),
      )

      const templatesQuery = new TemplatesQuery()
      templatesQuery.filterByLicensee(licensee._id)

      const records = await templatesQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: template1._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: template2._id })]))
    })
  })

  describe('filterByExpression', () => {
    it('returns licensees filtered by expression on name, expression, catalogMulti, catalogSingle, textReplyButton and messagesList', async () => {
      const template1 = await Template.create(templateFactory.build({ name: 'template1', licensee }))
      const template2 = await Template.create(templateFactory.build({ namespace: 'template2', licensee }))

      const templatesQuery = new TemplatesQuery()
      templatesQuery.filterByExpression('template')
      let records = await templatesQuery.all()

      expect(records.length).toEqual(2)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: template1._id })]))
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: template2._id })]))

      templatesQuery.filterByExpression('template1')
      records = await templatesQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: template1._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: template2._id })]))

      templatesQuery.filterByExpression('template2')
      records = await templatesQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: template2._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: template1._id })]))
    })
  })
})
