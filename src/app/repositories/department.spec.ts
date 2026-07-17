import Department from '@models/Department'
import mongoServer from '../../../.jest/utils'
import { licensee as licenseeFactory } from '@factories/licensee'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { DepartmentRepositoryDatabase } from '@repositories/department'
import mongoose from 'mongoose'

describe('department repository database', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#model', () => {
    it('returns the Department model', () => {
      const departmentRepository = new DepartmentRepositoryDatabase()

      expect(departmentRepository.model()).toEqual(Department)
    })
  })

  describe('#create', () => {
    it('creates a department', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())
      const userId = new mongoose.Types.ObjectId()

      const departmentRepository = new DepartmentRepositoryDatabase()
      const department = await departmentRepository.create({ name: 'Vendas', licensee, users: [userId], active: true })

      expect(department).toEqual(
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

      const departmentRepository = new DepartmentRepositoryDatabase()
      await departmentRepository.create({ name: 'Vendas', licensee, users: [userId] })
      await departmentRepository.create({ name: 'Suporte', licensee: otherLicensee, users: [userId] })

      const departments = await departmentRepository.find({ licensee: licensee._id })

      expect(departments).toHaveLength(1)
      expect(departments[0].name).toEqual('Vendas')
    })
  })
})
