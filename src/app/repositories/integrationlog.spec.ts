import mongoServer from '../../../.jest/utils'
import Integrationlog from '@models/Integrationlog'
import { integrationlog as integrationlogFactory } from '@factories/integrationlog'
import { licensee as licenseeFactory } from '@factories/licensee'
import { IntegrationlogRepositoryDatabase } from '@repositories/integrationlog'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'

describe('integrationlog repository database', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#model', () => {
    it('returns a model', () => {
      const integrationlogRepository = new IntegrationlogRepositoryDatabase()

      expect(integrationlogRepository.model()).toEqual(Integrationlog)
    })
  })

  describe('#create', () => {
    it('creates an integrationlog', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const integrationlogRepository = new IntegrationlogRepositoryDatabase()
      const integrationlog = await integrationlogRepository.create(integrationlogFactory.build({ licensee }))

      expect(integrationlog).toEqual(
        expect.objectContaining({
          log_description: 'Some integration',
          licensee,
          log_payload: expect.objectContaining({
            message: 'Success',
          }),
        }),
      )
    })
  })

  describe('#save', () => {
    it('saves an integrationlog document', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const integrationlogRepository = new IntegrationlogRepositoryDatabase()
      const integrationlog = await integrationlogRepository.create(integrationlogFactory.build({ licensee }))

      integrationlog.log_description = 'Updated integration'
      await integrationlogRepository.save(integrationlog)

      const integrationlogSaved = await integrationlogRepository.findFirst({ _id: integrationlog._id }, ['licensee'])
      expect(integrationlogSaved.log_description).toEqual('Updated integration')
      expect(integrationlogSaved.licensee).toEqual(expect.objectContaining({ _id: licensee._id }))
    })
  })
})
