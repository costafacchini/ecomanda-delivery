const User = require('@models/user')
const mongoServer = require('.jest/utils')

describe('User', () => {
  beforeEach(async () => {
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('email field', () => {
    it('is unique', async () => {
      const user1 = await User.create({ email: 'john@doe.com', password: '123456' })
      await user1.save()

      await expect(User.create({ email: 'john@doe.com', password: '123456' })).rejects.toThrow(
        'E11000 duplicate key error dup key: { : "john@doe.com" }'
      )
    })
  })

  describe('before save', () => {
    it('generates _id', async () => {
      const user = await User.create({ username: 'John Doe', email: 'john@doe.com', password: '123456' })
      await user.save()

      expect(user._id).not.toEqual(null)
    })

    it('encripts password if the password is modified', async () => {
      const user = await User.create({ username: 'John Doe', email: 'john@doe.com', password: '123456' })
      await user.save()

      expect(user.password).not.toEqual('123456')
    })

    it('does not encripts pawword if the password is not modified', async () => {
      const user = await User.create({ username: 'John Doe', email: 'john@doe.com', password: '123456' })
      await user.save()
      const originalPassword = user.password

      user.username = 'John Doe Silva'
      await user.save()

      expect(user.password).toEqual(originalPassword)
    })
  })

  describe('#validPassword', () => {
    it('is true when password informed is equal user password', async () => {
      const user = await User.create({ username: 'John Doe', email: 'john@doe.com', password: '123456' })
      await user.save()

      expect(user.password).not.toEqual('123456')
      expect(await user.validPassword('123456')).toEqual(true)
    })
  })
})
