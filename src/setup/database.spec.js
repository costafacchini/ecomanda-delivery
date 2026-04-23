import mongoServer from '../../.jest/utils.js'
import User from '@models/User.js'
import { createDefaultUser } from './database.js'
import { userSuper as userSuperFactory } from '../app/factories/user.js'

describe('#createDefaultUser', () => {
  beforeEach(async () => {
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('creates the default user if there is none', async () => {
    expect(await User.countDocuments()).toEqual(0)

    await createDefaultUser()
    expect(await User.countDocuments()).toEqual(1)
  })

  it('creates the default user if other users exist but the default one is missing', async () => {
    const user = await new User(userSuperFactory.build({ email: 'other-user@example.com' }))
    await user.save()

    expect(await User.countDocuments()).toEqual(1)

    await createDefaultUser()
    expect(await User.countDocuments()).toEqual(2)
    expect(await User.findOne({ email: process.env.DEFAULT_USER })).toBeTruthy()
  })

  it('does not create a duplicate if the default user already exists', async () => {
    await User.create(
      userSuperFactory.build({
        email: process.env.DEFAULT_USER,
        password: process.env.DEFAULT_PASSWORD,
      }),
    )

    expect(await User.countDocuments()).toEqual(1)

    await createDefaultUser()
    expect(await User.countDocuments()).toEqual(1)
  })

  it('throw exception if some error occurs', async () => {
    jest.spyOn(User, 'findOne').mockImplementation(() => {
      throw new Error('Erro')
    })

    await expect(createDefaultUser()).rejects.toThrow('Não foi possível criar o usuário padrão. Erro: Error: Erro')
  })

  it('ignores duplicate key races and returns the created default user', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValueOnce(null).mockResolvedValueOnce({ email: process.env.DEFAULT_USER })
    jest.spyOn(User.prototype, 'save').mockRejectedValueOnce({ code: 11000 })

    await expect(createDefaultUser()).resolves.toEqual({ email: process.env.DEFAULT_USER })
  })
})
