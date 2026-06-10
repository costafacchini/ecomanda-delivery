import WhatsappSession from '@models/WhatsappSession'
import mongoServer from '../../../.jest/utils'
import { licensee as licenseeFactory } from '@factories/licensee'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import mongoose from 'mongoose'

describe('WhatsappSession', () => {
  let licensee: any

  beforeEach(async () => {
    await mongoServer.connect()

    const licenseeRepository = new LicenseeRepositoryDatabase()
    licensee = await licenseeRepository.create(licenseeFactory.build())
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('sector field', () => {
    it('defaults sector to null', async () => {
      const session = await WhatsappSession.create({ licensee })

      expect(session.sector).toBeNull()
    })

    it('accepts a sector ObjectId', async () => {
      const sectorId = new mongoose.Types.ObjectId()
      const session = await WhatsappSession.create({ licensee, sector: sectorId })

      expect(session.sector?.toString()).toEqual(sectorId.toString())
    })
  })

  describe('compound unique index (licensee + sector)', () => {
    beforeEach(async () => {
      await WhatsappSession.syncIndexes()
    })

    it('allows two sessions for the same licensee when sectors differ', async () => {
      const sectorA = new mongoose.Types.ObjectId()
      const sectorB = new mongoose.Types.ObjectId()

      await WhatsappSession.create({ licensee, sector: sectorA })
      const second = await WhatsappSession.create({ licensee, sector: sectorB })

      expect(second._id).toBeDefined()
    })

    it('rejects a duplicate (licensee + sector) pair', async () => {
      const sectorId = new mongoose.Types.ObjectId()

      await WhatsappSession.create({ licensee, sector: sectorId })

      await expect(WhatsappSession.create({ licensee, sector: sectorId })).rejects.toThrow()
    })
  })
})
