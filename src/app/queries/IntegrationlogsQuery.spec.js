import { IntegrationlogsQuery } from '@queries/IntegrationlogsQuery'
import mongoServer from '../../../.jest/utils'
import Integrationlog from '@models/Integrationlog'
import { licensee as licenseeFactory } from '@factories/licensee'
import { integrationlog as integrationlogFactory } from '@factories/integrationlog'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'

describe('IntegrationlogsQuery', () => {
  let licensee

  beforeEach(async () => {
    await mongoServer.connect()

    const licenseeRepository = new LicenseeRepositoryDatabase()
    licensee = await licenseeRepository.create(licenseeFactory.build())
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#all', () => {
    it('returns all integrationlogs ordered by createdAt', async () => {
      const integrationlog1 = await Integrationlog.create(
        integrationlogFactory.build({
          licensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 0),
        }),
      )
      const integrationlog2 = await Integrationlog.create(
        integrationlogFactory.build({
          licensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 1),
        }),
      )

      const integrationlogsQuery = new IntegrationlogsQuery()
      const records = await integrationlogsQuery.all()

      expect(records.length).toEqual(2)
      expect(records[0]).toEqual(expect.objectContaining({ _id: integrationlog2._id }))
      expect(records[1]).toEqual(expect.objectContaining({ _id: integrationlog1._id }))
    })

    describe('filterByCreatedAt', () => {
      it('returns integrationlogs filtered by createdAt', async () => {
        const integrationlog1 = await Integrationlog.create(
          integrationlogFactory.build({
            licensee,
            createdAt: new Date(2021, 6, 3, 0, 0, 1),
          }),
        )
        const integrationlog2 = await Integrationlog.create(
          integrationlogFactory.build({
            licensee,
            createdAt: new Date(2021, 6, 3, 23, 59, 58),
          }),
        )
        const integrationlogBefore = await Integrationlog.create(
          integrationlogFactory.build({
            licensee,
            createdAt: new Date(2021, 6, 2, 23, 59, 59),
          }),
        )
        const integrationlogAfter = await Integrationlog.create(
          integrationlogFactory.build({
            licensee,
            createdAt: new Date(2021, 6, 4, 0, 0, 0),
          }),
        )

        const integrationlogsQuery = new IntegrationlogsQuery()
        integrationlogsQuery.filterByCreatedAt(new Date(2021, 6, 3, 0, 0, 0), new Date(2021, 6, 3, 23, 59, 59))

        const records = await integrationlogsQuery.all()

        expect(records.length).toEqual(2)
        expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: integrationlog2._id })]))
        expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: integrationlog1._id })]))
        expect(records).not.toEqual(
          expect.arrayContaining([expect.objectContaining({ _id: integrationlogBefore._id })]),
        )
        expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: integrationlogAfter._id })]))
      })
    })

    describe('filterByLicensee', () => {
      it('returns integrationlogs filtered by licensee', async () => {
        const integrationlog = await Integrationlog.create(
          integrationlogFactory.build({
            licensee,
            createdAt: new Date(2021, 6, 3, 0, 0, 1),
          }),
        )

        const licenseeRepository = new LicenseeRepositoryDatabase()
        const anotherLicensee = await licenseeRepository.create(licenseeFactory.build())
        const anotherMessage = await Integrationlog.create(
          integrationlogFactory.build({
            licensee: anotherLicensee,
            createdAt: new Date(2021, 6, 3, 0, 0, 1),
          }),
        )

        const integrationlogsQuery = new IntegrationlogsQuery()
        integrationlogsQuery.filterByLicensee(licensee._id)

        const records = await integrationlogsQuery.all()

        expect(records.length).toEqual(1)
        expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: integrationlog._id })]))
        expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: anotherMessage._id })]))
      })
    })

    describe('sortBy', () => {
      it('returns all integrationlogs ordered by using sortBy clause', async () => {
        const integrationlog1 = await Integrationlog.create(
          integrationlogFactory.build({
            licensee,
            createdAt: new Date(2021, 6, 3, 0, 0, 0),
          }),
        )
        const integrationlog2 = await Integrationlog.create(
          integrationlogFactory.build({
            licensee,
            createdAt: new Date(2021, 6, 3, 0, 0, 1),
          }),
        )

        const integrationlogsQuery = new IntegrationlogsQuery()
        integrationlogsQuery.sortBy('createdAt', 'asc')
        const records = await integrationlogsQuery.all()

        expect(records.length).toEqual(2)
        expect(records[0]).toEqual(expect.objectContaining({ _id: integrationlog1._id }))
        expect(records[1]).toEqual(expect.objectContaining({ _id: integrationlog2._id }))
      })
    })
  })
})
