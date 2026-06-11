import WhatsappSession from '@models/WhatsappSession'
import mongoServer from '../../../.jest/utils'
import { licensee as licenseeFactory } from '@factories/licensee'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { SectorRepositoryDatabase } from '@repositories/sector'
import { UserRepositoryDatabase } from '@repositories/user'
import { sector as sectorFactory } from '@factories/sector'
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

  describe('sector field', () => {
    it('defaults sector to null', async () => {
      const session = await WhatsappSession.create({ licensee })

      expect(session.sector).toBeNull()
    })

    it('accepts a sector ObjectId', async () => {
      const userRepository = new UserRepositoryDatabase()
      const user = await userRepository.create(userFactory.build({ licensee }))

      const sectorRepository = new SectorRepositoryDatabase()
      const sector = await sectorRepository.create(sectorFactory.build({ licensee, users: [user] }))
      const session = await WhatsappSession.create({ licensee, sector: sector._id })

      expect(session.sector?.toString()).toEqual(sector._id.toString())
    })
  })

  describe('compound unique index (licensee + sector)', () => {
    beforeEach(async () => {
      await WhatsappSession.syncIndexes()
    })

    it('allows two sessions for the same licensee when sectors differ', async () => {
      const userRepository = new UserRepositoryDatabase()
      const user = await userRepository.create(userFactory.build({ licensee }))

      const sectorRepository = new SectorRepositoryDatabase()
      const sectorA = await sectorRepository.create(sectorFactory.build({ licensee, users: [user] }))
      const sectorB = await sectorRepository.create(sectorFactory.build({ licensee, users: [user] }))

      await WhatsappSession.create({ licensee, sector: sectorA })
      const second = await WhatsappSession.create({ licensee, sector: sectorB })

      expect(second._id).toBeDefined()
    })

    it('rejects a duplicate (licensee + sector) pair', async () => {
      const userRepository = new UserRepositoryDatabase()
      const user = await userRepository.create(userFactory.build({ licensee }))

      const sectorRepository = new SectorRepositoryDatabase()
      const sector = await sectorRepository.create(sectorFactory.build({ licensee, users: [user] }))

      await WhatsappSession.create({ licensee, sector: sector })

      await expect(WhatsappSession.create({ licensee, sector: sector })).rejects.toThrow()
    })
  })
})
