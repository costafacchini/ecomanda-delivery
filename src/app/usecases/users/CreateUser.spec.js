import { user as userFactory } from '@factories/user'
import { licensee as licenseeFactory } from '@factories/licensee'
import { LicenseeRepositoryMemory } from '@repositories/licensee'
import { UserRepositoryMemory } from '@repositories/user'
import { CreateUser } from './CreateUser.js'

describe('CreateUser', () => {
  it('creates a user with permitted fields only', async () => {
    const userRepository = new UserRepositoryMemory()
    const licenseeRepository = new LicenseeRepositoryMemory()
    const createUser = new CreateUser({ userRepository })
    const licensee = await licenseeRepository.create(licenseeFactory.build())

    const user = await createUser.execute({
      ...userFactory.build({
        name: 'Mary Jane',
        email: 'mary@jane.com',
        isAdmin: true,
        licensee: licensee._id,
      }),
      ignoredField: 'ignored',
    })

    expect(user).toEqual(
      expect.objectContaining({
        name: 'Mary Jane',
        email: 'mary@jane.com',
        active: true,
        isAdmin: true,
        isSuper: false,
        licensee: licensee._id,
      }),
    )
    expect(user.ignoredField).toBeUndefined()
    expect(user.password).not.toEqual('12345678')
    await expect(user.validPassword('12345678')).resolves.toEqual(true)
  })
})
