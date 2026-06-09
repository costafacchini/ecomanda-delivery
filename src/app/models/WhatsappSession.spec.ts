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

  describe('setor field', () => {
    it('defaults setor to null', async () => {
      const session = await WhatsappSession.create({ licensee })

      expect(session.setor).toBeNull()
    })

    it('accepts a setor ObjectId', async () => {
      const setorId = new mongoose.Types.ObjectId()
      const session = await WhatsappSession.create({ licensee, setor: setorId })

      expect(session.setor?.toString()).toEqual(setorId.toString())
    })
  })

  describe('compound unique index (licensee + setor)', () => {
    beforeEach(async () => {
      await WhatsappSession.syncIndexes()
    })

    it('allows two sessions for the same licensee when setors differ', async () => {
      const setorA = new mongoose.Types.ObjectId()
      const setorB = new mongoose.Types.ObjectId()

      await WhatsappSession.create({ licensee, setor: setorA })
      const second = await WhatsappSession.create({ licensee, setor: setorB })

      expect(second._id).toBeDefined()
    })

    it('rejects a duplicate (licensee + setor) pair', async () => {
      const setorId = new mongoose.Types.ObjectId()

      await WhatsappSession.create({ licensee, setor: setorId })

      await expect(WhatsappSession.create({ licensee, setor: setorId })).rejects.toThrow()
    })
  })
})
