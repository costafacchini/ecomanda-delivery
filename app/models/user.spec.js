const User = require('@models/user')
const mongoServer = require('.jest/utils')
const bcrypt = require('bcrypt')

describe('User', () => {
  beforeEach(async () => {
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('email field', () => {
    it('is unique', async () => {
      await User.create({ email: 'john@doe.com', password: '123456' })

      await expect(User.create({ email: 'john@doe.com', password: '123456' })).rejects.toThrowError(
        'E11000 duplicate key error dup key: { : "john@doe.com" }'
      )
    })
  })

  describe('before save', () => {
    it('generates _id', async () => {
      const user = await User.create({ name: 'John Doe', email: 'john@doe.com', password: '123456' })

      expect(user._id).not.toEqual(null)
    })

    it('encripts password if the password is modified', async () => {
      const user = await User.create({ name: 'John Doe', email: 'john@doe.com', password: '123456' })

      expect(user.password).not.toEqual('123456')
    })

    it('does not encripts pawword if the password is not modified', async () => {
      const user = await User.create({ name: 'John Doe', email: 'john@doe.com', password: '123456' })
      const originalPassword = user.password

      user.name = 'John Doe Silva'
      await user.save()

      expect(user.password).toEqual(originalPassword)
    })
  })

  describe('#validPassword', () => {
    it('is true when password informed is equal user password', async () => {
      const user = await User.create({ name: 'John Doe', email: 'john@doe.com', password: '123456' })

      expect(user.password).not.toEqual('123456')
      expect(await user.validPassword('123456')).toEqual(true)
    })
  })
})
