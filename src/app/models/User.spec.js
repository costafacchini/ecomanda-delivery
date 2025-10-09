import User from '@models/User.js'
import mongoServer from '../../../.jest/utils.js'

describe('User', () => {
  beforeEach(async () => {
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('before save', () => {
    it('generates _id', async () => {
      const user = await User.create({ name: 'John Doe', email: 'john@doe.com', password: '12345678', isSuper: true })

      expect(user._id).not.toEqual(null)
    })

    it('does not changes _id if user is changed', async () => {
      const user = await User.create({ name: 'John Doe', email: 'john@doe.com', password: '12345678', isSuper: true })

      user.name = 'Changed'
      const alteredUser = await user.save()

      expect(user._id).toEqual(alteredUser._id)
      expect(alteredUser.name).toEqual('Changed')
    })

    it('encripts password if the password is modified', async () => {
      const user = await User.create({ name: 'John Doe', email: 'john@doe.com', password: '12345678', isSuper: true })

      expect(user.password).not.toEqual('12345678')
    })

    it('does not encripts pasword if the password is not modified', async () => {
      const user = await User.create({ name: 'John Doe', email: 'john@doe.com', password: '12345678', isSuper: true })
      const originalPassword = user.password

      user.name = 'John Doe Silva'
      await user.save()

      expect(user.password).toEqual(originalPassword)
    })

    it('fills the fields that have a default value', () => {
      const user = new User()

      expect(user.active).toEqual(true)
    })
  })

  describe('#validPassword', () => {
    it('is true when password informed is equal user password', async () => {
      const user = await User.create({ name: 'John Doe', email: 'john@doe.com', password: '12345678', isSuper: true })

      expect(user.password).not.toEqual('12345678')
      expect(await user.validPassword('12345678')).toEqual(true)
    })
  })

  describe('validations', () => {
    describe('name', () => {
      it('is required', () => {
        const user = new User({ email: 'john@doe.com', password: '12345678', isSuper: true })
        const validation = user.validateSync()

        expect(validation.errors['name'].message).toEqual('Nome: Você deve preencher o campo')
      })

      it('greater than 4 characters', () => {
        const user = new User({ name: 'abc', email: 'john@doe.com', password: '12345678', isSuper: true })
        const validation = user.validateSync()

        expect(validation.errors['name'].message).toEqual(
          'Nome: Informe um valor com mais que 4 caracteres! Atual: abc',
        )
      })
    })

    describe('password', () => {
      it('greater than 8 characters', () => {
        const user = new User({ name: 'John Doe', email: 'john@doe.com', password: '123456', isSuper: true })
        const validation = user.validateSync()

        expect(validation.errors['password'].message).toEqual('Senha: Informe um valor com mais que 8 caracteres!')
      })
    })

    describe('email', () => {
      it('is required', () => {
        const user = new User({ name: 'John Doe', password: '12345678', isSuper: true })
        const validation = user.validateSync()

        expect(validation.errors['email'].message).toEqual('Email: Você deve preencher o campo')
      })

      it('is unique', async () => {
        await User.create({ name: 'John Doe', email: 'john@doe.com', password: '12345678', isSuper: true })

        try {
          await User.create({ name: 'John Doe', email: 'john@doe.com', password: '12345678', isSuper: true })
        } catch (err) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(err.toString()).toMatch(/duplicate key error/)
        }

        const user = await User.create({
          name: 'Mary Jane',
          email: 'mary@doe.com',
          password: '12345678',
          isSuper: true,
        })
        try {
          user.email = 'john@doe.com'
          await user.save()
        } catch (err) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(err.toString()).toMatch(/duplicate key error/)
        }
      })
    })

    describe('licensee', () => {
      it('is not required if user isSuper', () => {
        const user = new User({ isSuper: true })
        const validation = user.validateSync()

        expect(validation.errors['licensee']).not.toBeDefined()
      })

      it('is required if user not isSuper', () => {
        const user = new User({ isSuper: false })
        const validation = user.validateSync()

        expect(validation.errors['licensee'].message).toEqual('Licensee: Você deve preencher o campo')
      })
    })
  })
})
