import Setor from '@models/Setor'
import mongoServer from '../../../.jest/utils'
import { licensee as licenseeFactory } from '@factories/licensee'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import mongoose from 'mongoose'

describe('Setor', () => {
  beforeEach(async () => {
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('before save', () => {
    it('generates _id', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())
      const userId = new mongoose.Types.ObjectId()

      const setor = await Setor.create({ name: 'Vendas', licensee, users: [userId] })

      expect(setor._id).not.toBeNull()
    })

    it('defaults active to true', () => {
      const setor = new Setor({ name: 'Vendas' })

      expect(setor.active).toEqual(true)
    })
  })

  describe('validations', () => {
    it('fails when name is missing', async () => {
      const setor = new Setor({ licensee: new mongoose.Types.ObjectId(), users: [new mongoose.Types.ObjectId()] })
      const error = setor.validateSync()

      expect(error?.errors['name']).toBeDefined()
    })

    it('fails when licensee is missing', async () => {
      const setor = new Setor({ name: 'Vendas', users: [new mongoose.Types.ObjectId()] })
      const error = setor.validateSync()

      expect(error?.errors['licensee']).toBeDefined()
    })

    it('fails when users array is empty', async () => {
      const setor = new Setor({ name: 'Vendas', licensee: new mongoose.Types.ObjectId(), users: [] })
      const error = setor.validateSync()

      expect(error?.errors['users']).toBeDefined()
    })

    it('passes with name, licensee and at least one user', async () => {
      const setor = new Setor({
        name: 'Vendas',
        licensee: new mongoose.Types.ObjectId(),
        users: [new mongoose.Types.ObjectId()],
      })
      const error = setor.validateSync()

      expect(error).toBeUndefined()
    })
  })
})
