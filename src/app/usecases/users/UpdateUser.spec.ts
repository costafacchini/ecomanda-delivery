import { user as userFactory } from '@factories/user'
import { licensee as licenseeFactory } from '@factories/licensee'
import { LicenseeRepositoryMemory } from '@repositories/licensee'
import { UserRepositoryMemory } from '@repositories/user'
import { UpdateUser } from './UpdateUser'

describe('UpdateUser', () => {
  it('updates a user with permitted fields and preserves non-updatable data', async () => {
    const userRepository = new UserRepositoryMemory()
    const licenseeRepository = new LicenseeRepositoryMemory()
    const updateUser = new UpdateUser({ userRepository })
    const originalLicensee = await licenseeRepository.create(licenseeFactory.build())
    const nextLicensee = await licenseeRepository.create(licenseeFactory.build({ name: 'Other licensee' }))
    const user = await userRepository.create(
      userFactory.build({
        name: 'John Doe',
        email: 'john@doe.com',
        licensee: originalLicensee._id,
      }),
    )

    const updatedUser = await updateUser.execute(user._id, {
      _id: 'ignored',
      name: 'Bruno Mars',
      email: 'bruno@mars.com',
      password: '87654321',
      active: false,
      isAdmin: true,
      licensee: nextLicensee._id,
    })

    expect(updatedUser).toEqual(
      expect.objectContaining({
        _id: user._id,
        name: 'Bruno Mars',
        email: 'bruno@mars.com',
        active: false,
        isAdmin: true,
        licensee: originalLicensee._id,
      }),
    )

    const storedUser = await userRepository.findFirst({ _id: user._id })
    expect(storedUser.licensee).toEqual(originalLicensee._id)
  })
})
