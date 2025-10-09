import mongoServer from '../../.jest/utils.js'
import User from '@models/User.js'
import { createDefaultUser  } from './database.js'
import { userSuper as userSuperFactory   } from '../app/factories/user.js'

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

  it('does not create the default user if has users', async () => {
    const user = await new User(userSuperFactory.build())
    await user.save()

    expect(await User.countDocuments()).toEqual(1)

    await createDefaultUser()
    expect(await User.countDocuments()).toEqual(1)
  })

  it('throw exception if some error occurs', async () => {
    jest.spyOn(User, 'countDocuments').mockImplementation(() => {
      throw new Error('Erro')
    })

    await expect(createDefaultUser()).rejects.toThrow('Não foi possível criar o usuário padrão. Erro: Error: Erro')
  })
})
