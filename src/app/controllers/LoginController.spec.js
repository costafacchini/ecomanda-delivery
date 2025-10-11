import User from '@models/User'
import jwt from 'jsonwebtoken'
import request from 'supertest'
import mongoServer from '../../../.jest/utils'
import { expressServer } from '../../../.jest/server-express'
import { userSuper as userSuperFactory } from '@factories/user'

describe('login controller', () => {
  beforeAll(async () => {
    await mongoServer.connect()
    await User.create(userSuperFactory.build())
  })

  afterAll(async () => {
    await mongoServer.disconnect()
  })

  describe('login', () => {
    describe('response', () => {
      it('returns status 200 and the token if the login is successful', async () => {
        await request(expressServer)
          .post('/login')
          .send({ email: 'john@doe.com', password: '12345678' })
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.token).toBeDefined()
            expect(response.body.token).not.toBe('')
            expect(response.body.token).not.toBe(null)
          })
      })

      it('returns status 401 and message if the user not exists', async () => {
        await request(expressServer)
          .post('/login')
          .send({ email: 'mary@doe.com', password: '12345678' })
          .expect('Content-Type', /json/)
          .expect(401, {
            message: 'Email ou senha inválidos!',
          })
      })

      it('returns status 401 and message if the password is invalid', async () => {
        await request(expressServer)
          .post('/login')
          .send({ email: 'john@doe.com', password: '987534378' })
          .expect('Content-Type', /json/)
          .expect(401, {
            message: 'Email ou senha inválidos!',
          })
      })

      it('returns status 401 and message if email not informed', async () => {
        await request(expressServer)
          .post('/login')
          .send({ password: '123456' })
          .expect('Content-Type', /json/)
          .expect(401, {
            message: 'Login inválido!',
          })
      })

      it('returns status 401 and message if password not informed', async () => {
        await request(expressServer)
          .post('/login')
          .send({ email: 'john@doe.com' })
          .expect('Content-Type', /json/)
          .expect(401, {
            message: 'Login inválido!',
          })
      })

      it('returns status 401 and message if is not active', async () => {
        await User.create(userSuperFactory.build({ email: 'mary@doe.com', active: false }))

        await request(expressServer)
          .post('/login')
          .send({ email: 'mary@doe.com', password: '12345678' })
          .expect('Content-Type', /json/)
          .expect(401, {
            message: 'Email ou senha inválidos!',
          })
      })

      it('returns status 500 and message if exception occurs', async () => {
        jest.spyOn(jwt, 'sign').mockImplementation(() => {
          throw new Error('Erro')
        })

        await request(expressServer)
          .post('/login')
          .send({ email: 'john@doe.com', password: '12345678' })
          .expect('Content-Type', /json/)
          .expect(500, {
            message: 'Erro ao tentar fazer login. Error: Erro',
          })
      })
    })
  })
})
