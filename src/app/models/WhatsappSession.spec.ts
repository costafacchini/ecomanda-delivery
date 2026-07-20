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

  describe('inbox field', () => {
    it('defaults inbox to null', async () => {
      const session = await WhatsappSession.create({ licensee })

      expect(session.inbox).toBeNull()
    })

    it('accepts an inbox ObjectId', async () => {
      const userRepository = new UserRepositoryDatabase()
      const user = await userRepository.create(userFactory.build({ licensee }))

      const departmentRepository = new DepartmentRepositoryDatabase()
      const department = await departmentRepository.create(sectorFactory.build({ licensee, users: [user] }))
      const session = await WhatsappSession.create({ licensee, inbox: department._id })

      expect(session.inbox?.toString()).toEqual(department._id.toString())
    })
  })

  describe('compound unique index (licensee + inbox)', () => {
    beforeEach(async () => {
      await WhatsappSession.syncIndexes()
    })

    it('allows two sessions for the same licensee when inboxes differ', async () => {
      const userRepository = new UserRepositoryDatabase()
      const user = await userRepository.create(userFactory.build({ licensee }))

      const departmentRepository = new DepartmentRepositoryDatabase()
      const inboxA = await departmentRepository.create(sectorFactory.build({ licensee, users: [user] }))
      const inboxB = await departmentRepository.create(sectorFactory.build({ licensee, users: [user] }))

      await WhatsappSession.create({ licensee, inbox: inboxA })
      const second = await WhatsappSession.create({ licensee, inbox: inboxB })

      expect(second._id).toBeDefined()
    })

    it('rejects a duplicate (licensee + inbox) pair', async () => {
      const userRepository = new UserRepositoryDatabase()
      const user = await userRepository.create(userFactory.build({ licensee }))

      const departmentRepository = new DepartmentRepositoryDatabase()
      const inbox = await departmentRepository.create(sectorFactory.build({ licensee, users: [user] }))

      await WhatsappSession.create({ licensee, inbox: inbox })

      await expect(WhatsappSession.create({ licensee, inbox: inbox })).rejects.toThrow()
    })
  })
})
