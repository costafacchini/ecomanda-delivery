import Sector from '@models/Sector'
import mongoServer from '../../../.jest/utils'
import { licensee as licenseeFactory } from '@factories/licensee'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { SectorRepositoryDatabase } from '@repositories/sector'
import mongoose from 'mongoose'

describe('sector repository database', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#model', () => {
    it('returns the Sector model', () => {
      const sectorRepository = new SectorRepositoryDatabase()

      expect(sectorRepository.model()).toEqual(Sector)
    })
  })

  describe('#create', () => {
    it('creates a sector', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())
      const userId = new mongoose.Types.ObjectId()

      const sectorRepository = new SectorRepositoryDatabase()
      const sector = await sectorRepository.create({ name: 'Vendas', licensee, users: [userId], active: true })

      expect(sector).toEqual(
        expect.objectContaining({
          name: 'Vendas',
          active: true,
        }),
      )
    })
  })

  describe('#find', () => {
    it('filters by licensee', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())
      const otherLicensee = await licenseeRepository.create(licenseeFactory.build())
      const userId = new mongoose.Types.ObjectId()

      const sectorRepository = new SectorRepositoryDatabase()
      await sectorRepository.create({ name: 'Vendas', licensee, users: [userId] })
      await sectorRepository.create({ name: 'Suporte', licensee: otherLicensee, users: [userId] })

      const sectors = await sectorRepository.find({ licensee: licensee._id })

      expect(sectors).toHaveLength(1)
      expect(sectors[0].name).toEqual('Vendas')
    })
  })
})
