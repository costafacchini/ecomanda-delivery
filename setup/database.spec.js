const mongoServer = require('.jest/utils')
const User = require('@models/user')
const { createDefaultUser } = require('./database')

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
    const user = await new User({ email: 'teste', password: 'teste' })
    await user.save()

    expect(await User.countDocuments()).toEqual(1)

    await createDefaultUser()
    expect(await User.countDocuments()).toEqual(1)
  })
})
