const User = require('@models/user')
const mongoServer = require('.jest/utils')

describe('User', () => {
  beforeEach(async () => {
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('email', () => {
    it('is unique', async () => {
      await User.create({ name: 'John Doe', email: 'john@doe.com', password: '12345678' })

      await expect(User.create({ name: 'John Doe', email: 'john@doe.com', password: '12345678' })).rejects.toThrowError(
        'E11000 duplicate key error dup key: { : "john@doe.com" }'
      )
    })
  })

  describe('before save', () => {
    it('generates _id', async () => {
      const user = await User.create({ name: 'John Doe', email: 'john@doe.com', password: '12345678' })

      expect(user._id).not.toEqual(null)
    })

    it('encripts password if the password is modified', async () => {
      const user = await User.create({ name: 'John Doe', email: 'john@doe.com', password: '12345678' })

      expect(user.password).not.toEqual('12345678')
    })

    it('does not encripts pawword if the password is not modified', async () => {
      const user = await User.create({ name: 'John Doe', email: 'john@doe.com', password: '12345678' })
      const originalPassword = user.password

      user.name = 'John Doe Silva'
      await user.save()

      expect(user.password).toEqual(originalPassword)
    })
  })

  describe('#validPassword', () => {
    it('is true when password informed is equal user password', async () => {
      const user = await User.create({ name: 'John Doe', email: 'john@doe.com', password: '12345678' })

      expect(user.password).not.toEqual('12345678')
      expect(await user.validPassword('12345678')).toEqual(true)
    })
  })

  describe('validations', () => {
    describe('name', () => {
      it('is required', () => {
        const user = new User({ email: 'john@doe.com', password: '12345678' })
        const validation = user.validateSync()

        expect(validation.errors['name'].message).toEqual('Nome: Você deve preencher o campo')
      })

      it('greater than 4 characters', () => {
        const user = new User({ name: 'abc', email: 'john@doe.com', password: '12345678' })
        const validation = user.validateSync()

        expect(validation.errors['name'].message).toEqual('Nome: Informe um valor com mais que 4 caracteres! Atual: abc')
      })
    })

    describe('password', () => {
      it('greater than 8 characters', () => {
        const user = new User({ name: 'John Doe', email: 'john@doe.com', password: '123456' })
        const validation = user.validateSync()

        expect(validation.errors['password'].message).toEqual('Senha: Informe um valor com mais que 8 caracteres!')
      })
    })

    describe('email', () => {
      it('is required', () => {
        const user = new User({ name: 'John Doe', password: '12345678' })
        const validation = user.validateSync()

        expect(validation.errors['email'].message).toEqual('Email: Você deve preencher o campo')
      })

      it('is unique', async () => {
        await User.create({ name: 'John Doe', email: 'john@doe.com', password: '12345678' })

        try {
          await User.create({ name: 'John Doe', email: 'john@doe.com', password: '12345678' })
        } catch (err) {
          expect(err).toEqual('E11000 duplicate key error dup key: { : "john@doe.com" }')
        }

        const user = await User.create({ name: 'Mary Jane', email: 'mary@doe.com', password: '12345678' })
        try {
          user.email = 'john@doe.com'
          await user.save()
        } catch (err) {
          expect(err).toEqual('E11000 duplicate key error dup key: { : "john@doe.com" }')
        }
      })
    })
  })
})
