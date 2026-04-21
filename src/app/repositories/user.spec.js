import mongoServer from '../../../.jest/utils'
import User from '@models/User'
import { user as userFactory } from '@factories/user'
import { licensee as licenseeFactory } from '@factories/licensee'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { UserRepositoryDatabase } from '@repositories/user'

describe('user repository database', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#model', () => {
    it('returns a model', () => {
      const userRepository = new UserRepositoryDatabase()

      expect(userRepository.model()).toEqual(User)
    })
  })

  describe('#create', () => {
    it('creates a user', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const userRepository = new UserRepositoryDatabase()
      const user = await userRepository.create(userFactory.build({ licensee }))

      expect(user).toEqual(
        expect.objectContaining({
          name: 'Raymond Reddington',
          email: 'raymond@reddington.com',
          active: true,
          isSuper: false,
          licensee,
        }),
      )
      expect(await user.validPassword('12345678')).toEqual(true)
    })
  })

  describe('#save', () => {
    it('saves a user document', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const userRepository = new UserRepositoryDatabase()
      const user = await userRepository.create(userFactory.build({ licensee }))

      user.active = false
      await userRepository.save(user)

      const userSaved = await userRepository.findFirst({ _id: user._id }, ['licensee'])
      expect(userSaved.active).toEqual(false)
      expect(userSaved.licensee).toEqual(expect.objectContaining({ _id: licensee._id }))
    })
  })
})
