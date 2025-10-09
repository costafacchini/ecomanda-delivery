import mongoServer from '../../../.jest/utils.js'
import { LicenseeRepositoryDatabase  } from '@repositories/licensee.js'
import { licensee as licenseeFactory   } from '@factories/licensee.js'
import Licensee from '@models/Licensee.js'

describe('licensee repository database', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#model', () => {
    it('returns a model', () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()

      expect(licenseeRepository.model()).toEqual(Licensee)
    })
  })

  describe('#create', () => {
    it('creates a new licensee', async () => {
      const licenseeData = {
        name: 'Alcateia Ltds',
        active: true,
        licenseKind: 'demo',
      }

      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licenseeSaved = await licenseeRepository.create(licenseeData)

      expect(licenseeSaved._id).toBeDefined()
      expect(licenseeSaved.name).toEqual('Alcateia Ltds')
      expect(licenseeSaved.active).toEqual(true)
      expect(licenseeSaved.licenseKind).toEqual('demo')
    })

    describe('when is invalid licensee', () => {
      it('generate exception with error', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()

        await expect(async () => {
          await licenseeRepository.create()
        }).rejects.toThrow(
          'Licensee validation failed: licenseKind: Tipo de Licença: Você deve informar um valor ( demo | free | paid), name: Nome: Você deve preencher o campo',
        )
      })
    })
  })

  describe('#findFirst', () => {
    it('finds a licensee', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()

      await licenseeRepository.create(licenseeFactory.build({ name: 'Company One' }))
      await licenseeRepository.create(licenseeFactory.build({ name: 'Company Two', active: true }))
      await licenseeRepository.create(licenseeFactory.build({ name: 'Company Two', active: false }))

      let result = await licenseeRepository.findFirst()
      expect(result).toEqual(expect.objectContaining({ name: 'Company One' }))

      result = await licenseeRepository.findFirst({ name: 'Company Two' })
      expect(result).toEqual(expect.objectContaining({ name: 'Company Two', active: true }))
    })
  })

  describe('#update', () => {
    it('updates licensee', async () => {
      const licenseeData = { name: 'Alcateia Ltds', active: true, licenseKind: 'demo' }

      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeData)
      licensee.name = 'Name Updated'

      const status = await licenseeRepository.update(licensee._id, { ...licensee })
      expect(status.acknowledged).toEqual(true)
    })

    describe('when is invalid', () => {
      it('generate exception with error', async () => {
        const licenseeData = { name: 'Alcateia Ltds', active: true, licenseKind: 'demo' }

        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeData)
        licensee.name = null

        await expect(async () => {
          await licenseeRepository.update(licensee._id, { ...licensee })
        }).rejects.toThrow('Validation failed: name: Nome: Você deve preencher o campo')
      })
    })
  })

  describe('#find', () => {
    it('finds licensee', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()

      await licenseeRepository.create(licenseeFactory.build({ name: 'Company One', active: true }))
      await licenseeRepository.create(licenseeFactory.build({ name: 'Company Two', active: true }))
      await licenseeRepository.create(licenseeFactory.build({ name: 'Company Three', active: false }))

      let result = await licenseeRepository.find({ active: true })
      expect(result.length).toEqual(2)
    })
  })
})
