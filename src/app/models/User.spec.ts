import User from '@models/User'
import mongoServer from '../../../.jest/utils'

describe('User', () => {
  beforeEach(async () => {
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('before save', () => {
    it('generates _id', async () => {
      const user = await User.create({ name: 'John Doe', email: 'john@doe.com', password: '12345678', role: 'super' })

      expect(user._id).not.toEqual(null)
    })

    it('defaults role to agent', () => {
      const user = new User({ name: 'John Doe', email: 'john@doe.com', password: '12345678' })

      expect(user.role).toEqual('agent')
    })

    it('does not changes _id if user is changed', async () => {
      const user = await User.create({ name: 'John Doe', email: 'john@doe.com', password: '12345678', role: 'super' })

      user.name = 'Changed'
      const alteredUser = await user.save()

      expect(user._id).toEqual(alteredUser._id)
      expect(alteredUser.name).toEqual('Changed')
    })

    it('encripts password if the password is modified', async () => {
      const user = await User.create({ name: 'John Doe', email: 'john@doe.com', password: '12345678', role: 'super' })

      expect(user.password).not.toEqual('12345678')
    })

    it('does not encripts pasword if the password is not modified', async () => {
      const user = await User.create({ name: 'John Doe', email: 'john@doe.com', password: '12345678', role: 'super' })
      const originalPassword = user.password

      user.name = 'John Doe Silva'
      await user.save()

      expect(user.password).toEqual(originalPassword)
    })

    it('fills the fields that have a default value', () => {
      const user = new User()

      expect(user.active).toEqual(true)
      expect(user.blockedLicensees).toEqual([])
    })
  })

  describe('#validPassword', () => {
    it('is true when password informed is equal user password', async () => {
      const user = await User.create({ name: 'John Doe', email: 'john@doe.com', password: '12345678', role: 'super' })

      expect(user.password).not.toEqual('12345678')
      expect(await user.validPassword('12345678')).toEqual(true)
    })
  })

  describe('validations', () => {
    describe('role', () => {
      it('is valid with allowed values', async () => {
        for (const role of ['agent', 'supervisor', 'admin', 'super']) {
          const user = new User({ name: 'John Doe', email: 'john@doe.com', password: '12345678', role })
          const validation = await user.validate().catch((e: any) => e)
          expect(validation?.errors['role']).toBeUndefined()
        }
      })

      it('is invalid with unknown value', async () => {
        const user = new User({ name: 'John Doe', email: 'john@doe.com', password: '12345678', role: 'owner' })
        const validation = await user.validate().catch((e: any) => e)

        expect(validation.errors['role']).toBeDefined()
      })
    })

    describe('name', () => {
      it('is required', async () => {
        const user = new User({ email: 'john@doe.com', password: '12345678', role: 'super' })
        const validation = await user.validate().catch((e: any) => e)

        expect(validation.errors['name'].message).toEqual('Nome: Você deve preencher o campo')
      })

      it('greater than 4 characters', async () => {
        const user = new User({ name: 'abc', email: 'john@doe.com', password: '12345678', role: 'super' })
        const validation = await user.validate().catch((e: any) => e)

        expect(validation.errors['name'].message).toEqual(
          'Nome: Informe um valor com mais que 4 caracteres! Atual: abc',
        )
      })
    })

    describe('password', () => {
      it('greater than 8 characters', async () => {
        const user = new User({ name: 'John Doe', email: 'john@doe.com', password: '123456', role: 'super' })
        const validation = await user.validate().catch((e: any) => e)

        expect(validation.errors['password'].message).toEqual('Senha: Informe um valor com mais que 8 caracteres!')
      })
    })

    describe('email', () => {
      it('is required', async () => {
        const user = new User({ name: 'John Doe', password: '12345678', role: 'super' })
        const validation = await user.validate().catch((e: any) => e)

        expect(validation.errors['email'].message).toEqual('Email: Você deve preencher o campo')
      })

      it('is unique', async () => {
        await User.create({ name: 'John Doe', email: 'john@doe.com', password: '12345678', role: 'super' })

        try {
          await User.create({ name: 'John Doe', email: 'john@doe.com', password: '12345678', role: 'super' })
        } catch (err) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(err.toString()).toMatch(/duplicate key error/)
        }

        const user = await User.create({
          name: 'Mary Jane',
          email: 'mary@doe.com',
          password: '12345678',
          role: 'super',
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
      it('is not required for admin or super roles', async () => {
        for (const role of ['admin', 'super']) {
          const user = new User({ role })
          const validation = await user.validate().catch((e: any) => e)
          expect(validation?.errors['licensee']).not.toBeDefined()
        }
      })

      it('is required for agent and supervisor roles', async () => {
        for (const role of ['agent', 'supervisor']) {
          const user = new User({ role })
          const validation = await user.validate().catch((e: any) => e)
          expect(validation.errors['licensee'].message).toEqual('Licensee: Você deve preencher o campo')
        }
      })
    })
  })
})
