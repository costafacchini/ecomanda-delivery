import WhatsappSession from '@models/WhatsappSession'
import mongoServer from '../../../.jest/utils'
import { licensee as licenseeFactory } from '@factories/licensee'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { DepartmentRepositoryDatabase } from '@repositories/department'
import { UserRepositoryDatabase } from '@repositories/user'
import { department as sectorFactory } from '@factories/department'
import { user as userFactory } from '@factories/user'

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

  describe('department field', () => {
    it('defaults department to null', async () => {
      const session = await WhatsappSession.create({ licensee })

      expect(session.department).toBeNull()
    })

    it('accepts a department ObjectId', async () => {
      const userRepository = new UserRepositoryDatabase()
      const user = await userRepository.create(userFactory.build({ licensee }))

      const departmentRepository = new DepartmentRepositoryDatabase()
      const department = await departmentRepository.create(sectorFactory.build({ licensee, users: [user] }))
      const session = await WhatsappSession.create({ licensee, department: department._id })

      expect(session.department?.toString()).toEqual(department._id.toString())
    })
  })

  describe('compound unique index (licensee + department)', () => {
    beforeEach(async () => {
      await WhatsappSession.syncIndexes()
    })

    it('allows two sessions for the same licensee when departments differ', async () => {
      const userRepository = new UserRepositoryDatabase()
      const user = await userRepository.create(userFactory.build({ licensee }))

      const departmentRepository = new DepartmentRepositoryDatabase()
      const departmentA = await departmentRepository.create(sectorFactory.build({ licensee, users: [user] }))
      const departmentB = await departmentRepository.create(sectorFactory.build({ licensee, users: [user] }))

      await WhatsappSession.create({ licensee, department: departmentA })
      const second = await WhatsappSession.create({ licensee, department: departmentB })

      expect(second._id).toBeDefined()
    })

    it('rejects a duplicate (licensee + department) pair', async () => {
      const userRepository = new UserRepositoryDatabase()
      const user = await userRepository.create(userFactory.build({ licensee }))

      const departmentRepository = new DepartmentRepositoryDatabase()
      const department = await departmentRepository.create(sectorFactory.build({ licensee, users: [user] }))

      await WhatsappSession.create({ licensee, department: department })

      await expect(WhatsappSession.create({ licensee, department: department })).rejects.toThrow()
    })
  })
})
