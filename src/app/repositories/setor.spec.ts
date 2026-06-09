import Setor from '@models/Setor'
import mongoServer from '../../../.jest/utils'
import { licensee as licenseeFactory } from '@factories/licensee'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { SetorRepositoryDatabase } from '@repositories/setor'
import mongoose from 'mongoose'

describe('setor repository database', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#model', () => {
    it('returns the Setor model', () => {
      const setorRepository = new SetorRepositoryDatabase()

      expect(setorRepository.model()).toEqual(Setor)
    })
  })

  describe('#create', () => {
    it('creates a setor', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())
      const userId = new mongoose.Types.ObjectId()

      const setorRepository = new SetorRepositoryDatabase()
      const setor = await setorRepository.create({ name: 'Vendas', licensee, users: [userId], active: true })

      expect(setor).toEqual(
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

      const setorRepository = new SetorRepositoryDatabase()
      await setorRepository.create({ name: 'Vendas', licensee, users: [userId] })
      await setorRepository.create({ name: 'Suporte', licensee: otherLicensee, users: [userId] })

      const setores = await setorRepository.find({ licensee: licensee._id })

      expect(setores).toHaveLength(1)
      expect(setores[0].name).toEqual('Vendas')
    })
  })
})
