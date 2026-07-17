import Department from '@models/Department'
import mongoServer from '../../../.jest/utils'
import { licensee as licenseeFactory } from '@factories/licensee'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import mongoose from 'mongoose'

describe('Department', () => {
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

      const department = await Department.create({ name: 'Vendas', licensee, users: [userId] })

      expect(department._id).not.toBeNull()
    })

    it('defaults active to true', () => {
      const department = new Department({ name: 'Vendas' })

      expect(department.active).toEqual(true)
    })

    it('auto-generates departmentToken as a UUID string', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())
      const userId = new mongoose.Types.ObjectId()

      const department = await Department.create({ name: 'Vendas', licensee, users: [userId] })

      expect(department.departmentToken).toMatch(/^[0-9a-f-]{36}$/)
    })
  })

  describe('webhookUrl virtual', () => {
    it('returns webhookUrl when licensee is populated', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())
      const userId = new mongoose.Types.ObjectId()

      const department = await Department.create({ name: 'Vendas', licensee, users: [userId] })
      const populated = await Department.findById(department._id).populate('licensee')

      expect(populated!.webhookUrl).toMatch(new RegExp(`token=${licensee.apiToken}&department=${department.departmentToken}`))
    })

    it('returns null when licensee is not populated', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())
      const userId = new mongoose.Types.ObjectId()

      const department = await Department.create({ name: 'Vendas', licensee, users: [userId] })
      const unpopulated = await Department.findById(department._id)

      expect(unpopulated!.webhookUrl).toBeNull()
    })
  })

  describe('validations', () => {
    it('fails when name is missing', async () => {
      const department = new Department({ licensee: new mongoose.Types.ObjectId(), users: [new mongoose.Types.ObjectId()] })
      const error = await department.validate().catch((e: any) => e)

      expect(error?.errors['name']).toBeDefined()
    })

    it('fails when licensee is missing', async () => {
      const department = new Department({ name: 'Vendas', users: [new mongoose.Types.ObjectId()] })
      const error = await department.validate().catch((e: any) => e)

      expect(error?.errors['licensee']).toBeDefined()
    })

    it('fails when users array is empty', async () => {
      const department = new Department({ name: 'Vendas', licensee: new mongoose.Types.ObjectId(), users: [] })
      const error = await department.validate().catch((e: any) => e)

      expect(error?.errors['users']).toBeDefined()
    })

    it('passes with name, licensee and at least one user', async () => {
      const department = new Department({
        name: 'Vendas',
        licensee: new mongoose.Types.ObjectId(),
        users: [new mongoose.Types.ObjectId()],
      })
      const error = await department.validate().catch((e: any) => e)

      expect(error).toBeUndefined()
    })
  })
})
