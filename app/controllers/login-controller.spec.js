const User = require('@models/user')
const mongoServer = require('.jest/utils')
const jwt = require('jsonwebtoken')

const express = require('express')
const routes = require('../../config/routes')
const request = require('supertest')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
routes(app)

describe('login controller', () => {
  beforeAll(async () => {
    await mongoServer.connect()
    await User.create({ email: 'john@doe.com', password: '123456' })
  })

  afterAll(async () => {
    await mongoServer.disconnect()
  })

  describe('login', () => {
    describe('response', () => {
      it('returns status 200 and the token if the login is successful', async () => {
        await request(app)
                .post('/login')
                .send({ email: 'john@doe.com', password: '123456' })
                .expect('Content-Type', /json/)
                .expect(200)
                .then(response => {
                  expect(response.body.email).not.toEqual(null)
                })
      })

      it('returns status 401 and message if the user not exists', async () => {
        await request(app)
          .post('/login')
          .send({ email: 'mary@doe.com', password: '123456' })
          .expect('Content-Type', /json/)
          .expect(401, {
            message: 'Email ou senha inválidos!'
          })
      })

      it('returns status 401 and message if the password is invalid', async () => {
        await request(app)
                .post('/login')
                .send({ email: 'john@doe.com', password: '9875343' })
                .expect('Content-Type', /json/)
                .expect(401, {
                  message: 'Email ou senha inválidos!'
                })
      })

      it('returns status 401 and message if email not informed', async () => {
        await request(app)
                .post('/login')
                .send({ password: '123456' })
                .expect('Content-Type', /json/)
                .expect(401, {
                  message: 'Login inválido!'
                })
      })

      it('returns status 401 and message if password not informed', async () => {
        await request(app)
                .post('/login')
                .send({ email: 'john@doe.com' })
                .expect('Content-Type', /json/)
                .expect(401, {
                  message: 'Login inválido!'
                })
      })

      it('returns status 500 and message if exception occurs', async () => {
        jest.spyOn(jwt, 'sign').mockImplementation(() => {
          throw new Error('Erro')
        })

        await request(app)
          .post('/login')
          .send({ email: 'john@doe.com', password: '123456' })
          .expect('Content-Type', /json/)
          .expect(500, {
            message: 'Erro ao tentar fazer login. Error: Erro'
          })
      })
    })
  })
})
