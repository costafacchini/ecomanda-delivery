const User = require('@models/user')
const mongoServer = require('.jest/utils')

const express = require('express')
const routes = require('../../config/routes')
const request = require('supertest')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
routes(app)

describe('user controller', () => {
  let token

  beforeAll(async () => {
    await mongoServer.connect()
    await User.create({
      email: 'john@doe.com',
      password: '12345678'
    })

    await request(app)
            .post('/login')
            .send({ email: 'john@doe.com', password: '12345678' })
            .then(response => {
              token = response.body.token
            })
  })

  afterAll(async () => {
    await mongoServer.disconnect()
  })

  describe('create', () => {
    describe('response', () => {
      it('returns status 201 and the user data if the login is successful', async () => {
        await request(app)
                .post('/resources/users/')
                .set('x-access-token', token)
                .send({ name: 'Mary Jane', email: 'mary@jane.com', password: '12345678' })
                .expect('Content-Type', /json/)
                .expect(201)
                .then(response => {
                  expect(response.body.email).toEqual('mary@jane.com')
                  expect(response.body.name).toEqual('Mary Jane')
                  expect(response.body._id).toBeDefined()
                  expect(response.body._id).not.toBe('')
                  expect(response.body._id).not.toBe(null)
                  expect(response.body.password).not.toBeDefined()
                })
      })

      it('returns status 422 and message if the some error ocurre when create the user', async () => {
        jest.spyOn(User, 'create').mockImplementation(() => {
          throw new Error('some error')
        })

        await request(app)
                .post('/resources/users/')
                .set('x-access-token', token)
                .send({ name: 'Silfer', email: 'silfer@tape.com', password: '12345678' })
                .expect('Content-Type', /json/)
                .expect(500, {
                  errors: { mensagem: 'Error: some error' }
                })
      })

      describe('validations', () => {
        it('returns status 422 and message if the email is not filled', async () => {
          await request(app)
                  .post('/resources/users/')
                  .set('x-access-token', token)
                  .send({ name: 'Mary Jane', password: '12345678' })
                  .expect('Content-Type', /json/)
                  .expect(422, {
                    errors: [{ mensagem: 'Email deve ser preenchido com um valor válido' }]
                  })
        })

        it('returns status 422 and message if the email is invalid', async () => {
          await request(app)
                  .post('/resources/users/')
                  .set('x-access-token', token)
                  .send({ name: 'Mary Jane', email: 'maryjane.com', password: '12345678' })
                  .expect('Content-Type', /json/)
                  .expect(422, {
                    errors: [{ mensagem: 'Email deve ser preenchido com um valor válido' }]
                  })
        })

        it('returns status 422 and message if the email already exists', async () => {
          await request(app)
                  .post('/resources/users/')
                  .set('x-access-token', token)
                  .send({ name: 'Mary Jane', email: 'john@doe.com', password: '12345678' })
                  .expect('Content-Type', /json/)
                  .expect(422, {
                    errors: [{ mensagem: 'E-mail já cadastrado' }]
                  })
        })

        it('returns status 422 and message if the password is less than 8 chars', async () => {
          await request(app)
                  .post('/resources/users/')
                  .set('x-access-token', token)
                  .send({ name: 'Silfer Tape', email: 'silfer@tape.com', password: '1234567' })
                  .expect('Content-Type', /json/)
                  .expect(422, {
                    errors: [{ mensagem: 'Senha deve ter no mínimo 8 caracteres' }]
                  })
        })

        it('returns status 422 and message if the name is less than 4 chars', async () => {
          await request(app)
                  .post('/resources/users/')
                  .set('x-access-token', token)
                  .send({ name: 'Sil', email: 'silfer@tape.com', password: '12345678' })
                  .expect('Content-Type', /json/)
                  .expect(422, {
                    errors: [{ mensagem: 'Nome deve ter no mínimo 4 caracteres' }]
                  })
        })
      })
    })
  })
})