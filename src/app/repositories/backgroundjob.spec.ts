import mongoServer from '../../../.jest/utils'
import Backgroundjob from '@models/Backgroundjob'
import { backgroundjob as backgroundjobFactory } from '@factories/backgroundjob'
import { licensee as licenseeFactory } from '@factories/licensee'
import { BackgroundjobRepositoryDatabase } from '@repositories/backgroundjob'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'

describe('backgroundjob repository database', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#model', () => {
    it('returns a model', () => {
      const backgroundjobRepository = new BackgroundjobRepositoryDatabase()

      expect(backgroundjobRepository.model()).toEqual(Backgroundjob)
    })
  })

  describe('#create', () => {
    it('creates a backgroundjob', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const backgroundjobRepository = new BackgroundjobRepositoryDatabase()
      const backgroundjob = await backgroundjobRepository.create(backgroundjobFactory.build({ licensee }))

      expect(backgroundjob).toEqual(
        expect.objectContaining({
          status: 'scheduled',
          kind: 'get-pix',
          licensee,
          body: expect.objectContaining({ cart_id: 'cart-id' }),
        }),
      )
    })
  })

  describe('#save', () => {
    it('saves a backgroundjob document', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const backgroundjobRepository = new BackgroundjobRepositoryDatabase()
      const backgroundjob = await backgroundjobRepository.create(backgroundjobFactory.build({ licensee }))

      backgroundjob.status = 'running'
      await backgroundjobRepository.save(backgroundjob)

      const backgroundjobSaved = await backgroundjobRepository.findFirst({ _id: backgroundjob._id }, ['licensee'])
      expect(backgroundjobSaved.status).toEqual('running')
      expect(backgroundjobSaved.licensee).toEqual(expect.objectContaining({ _id: licensee._id }))
    })
  })
})
