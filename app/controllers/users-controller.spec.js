const User = require('@models/user')
const request = require('supertest')
const mongoServer = require('.jest/utils')
const { expressServer } = require('.jest/server-express')

describe('user controller', () => {
  let token

  beforeAll(async () => {
    await mongoServer.connect()
    await User.create({
      name: 'John Doe',
      email: 'john@doe.com',
      password: '12345678',
    })

    await request(expressServer)
      .post('/login')
      .send({ email: 'john@doe.com', password: '12345678' })
      .then((response) => {
        token = response.body.token
      })
  })

  afterAll(async () => {
    await mongoServer.disconnect()
  })

  describe('about auth', () => {
    it('returns status 401 and message if x-access-token in not inform in header', async () => {
      await request(expressServer)
        .post('/resources/users/')
        .send({ name: 'Mary Jane', email: 'mary@jane.com', password: '12345678', active: true })
        .expect('Content-Type', /json/)
        .expect(401, {
          auth: false,
          message: 'Token não informado.',
        })
    })

    it('returns status 500 and message if x-access-token in not inform in header', async () => {
      await request(expressServer)
        .post('/resources/users/')
        .set('x-access-token', 'dasadasdasd')
        .send({ name: 'Mary Jane', email: 'mary@jane.com', password: '12345678', active: true })
        .expect('Content-Type', /json/)
        .expect(500, {
          auth: false,
          message: 'Falha na autenticação com token.',
        })
    })
  })

  describe('create', () => {
    describe('response', () => {
      it('returns status 201 and the user data if the create is successful', async () => {
        await request(expressServer)
          .post('/resources/users/')
          .set('x-access-token', token)
          .send({ name: 'Mary Jane', email: 'mary@jane.com', password: '12345678', active: true })
          .expect('Content-Type', /json/)
          .expect(201)
          .then((response) => {
            expect(response.body.email).toEqual('mary@jane.com')
            expect(response.body.name).toEqual('Mary Jane')
            expect(response.body.active).toEqual(true)
            expect(response.body._id).toBeDefined()
            expect(response.body._id).not.toBe('')
            expect(response.body._id).not.toBe(null)
            expect(response.body.password).not.toBeDefined()
          })
      })

      it('returns status 422 and message if the user is not valid', async () => {
        await request(expressServer)
          .post('/resources/users/')
          .set('x-access-token', token)
          .send({ name: 'Sil', email: 'silfer@tape.com', password: '123456' })
          .expect('Content-Type', /json/)
          .expect(422, {
            errors: [
              { message: 'Nome: Informe um valor com mais que 4 caracteres! Atual: Sil' },
              { message: 'Senha: Informe um valor com mais que 8 caracteres!' },
            ],
          })
      })

      it('returns status 500 and message if the some error ocurred when create the user', async () => {
        const mockFunction = jest.spyOn(User.prototype, 'save').mockImplementation(() => {
          throw new Error('some error')
        })

        await request(expressServer)
          .post('/resources/users/')
          .set('x-access-token', token)
          .send({ name: 'Silfer', email: 'silfer@tape.com', password: '12345678' })
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        mockFunction.mockRestore()
      })

      describe('validations', () => {
        it('returns status 422 and message if the email is invalid', async () => {
          await request(expressServer)
            .post('/resources/users/')
            .set('x-access-token', token)
            .send({ name: 'Mary Jane', email: 'maryjane.com', password: '12345678' })
            .expect('Content-Type', /json/)
            .expect(422, {
              errors: [{ message: 'Email deve ser preenchido com um valor válido' }],
            })
        })
      })
    })
  })

  describe('update', () => {
    describe('response', () => {
      it('returns status 200 and the user data if the update is successful', async () => {
        const user = await User.create({
          name: 'John Wick',
          email: 'john@wick.com',
          password: '12345678',
          active: true,
        })

        await request(expressServer)
          .post(`/resources/users/${user._id}`)
          .set('x-access-token', token)
          .send({ _id: 123, name: 'Bruno Mars', email: 'bruno@mars.com', password: '87654321', active: false })
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.name).toEqual('Bruno Mars')
            expect(response.body.active).toEqual(false)
            expect(response.body._id).not.toEqual(123)
            expect(response.body.email).not.toEqual('bruno@mars.com')
            expect(response.body.password).not.toBeDefined()
          })
      })

      it('returns status 422 and message if the some error ocurre when update the user', async () => {
        const user = await User.findOne({ email: 'john@doe.com' })

        await request(expressServer)
          .post(`/resources/users/${user._id}`)
          .set('x-access-token', token)
          .send({ name: '', email: 'silfer@tape.com', password: '' })
          .expect('Content-Type', /json/)
          .expect(422, {
            errors: [
              { message: 'Nome: Você deve preencher o campo' },
              { message: 'Senha: Informe um valor com mais que 8 caracteres!' },
            ],
          })
      })

      it('returns status 500 and message if the some error ocurre when update the user', async () => {
        const mockFunction = jest.spyOn(User, 'findOne').mockImplementation(() => {
          throw new Error('some error')
        })

        const user = await User.find({ email: 'john@doe.com' })

        await request(expressServer)
          .post(`/resources/users/${user[0]._id}`)
          .set('x-access-token', token)
          .send({ name: 'Silfer', email: 'silfer@tape.com', password: '12345678' })
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        mockFunction.mockRestore()
      })

      describe('validations', () => {
        it('returns status 422 and message if the email is invalid', async () => {
          const user = await User.findOne({ email: 'john@doe.com' })

          await request(expressServer)
            .post(`/resources/users/${user._id}`)
            .set('x-access-token', token)
            .send({ email: 'silfertape.com' })
            .expect('Content-Type', /json/)
            .expect(422, {
            errors: [ { message: 'Email deve ser preenchido com um valor válido' } ],
          })
        })
      })
    })
  })

  describe('show', () => {
    describe('response', () => {
      it('returns status 200 and message if user exists', async () => {
        const user = await User.create({
          name: 'Jonny Walker',
          email: 'jonny@walker.com',
          password: '12345678',
          active: true,
        })

        await request(expressServer)
          .get(`/resources/users/${user._id}`)
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.email).toEqual('jonny@walker.com')
            expect(response.body.name).toEqual('Jonny Walker')
            expect(response.body.active).toEqual(true)
            expect(response.body._id).toMatch(user._id.toString())
            expect(response.body._id).toBeDefined()
            expect(response.body._id).not.toBe('')
            expect(response.body._id).not.toBe(null)
            expect(response.body.password).not.toBeDefined()
          })
      })

      it('returns status 404 and message if user does not exists', async () => {
        await request(expressServer)
          .get('/resources/users/12312')
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(404, {
            errors: { message: 'Usuário 12312 não encontrado' },
          })
      })

      it('returns status 500 and message if occurs another error', async () => {
        const mockFunction = jest.spyOn(User, 'findOne').mockImplementation(() => {
          throw new Error('some error')
        })

        await request(expressServer)
          .get('/resources/users/12312')
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        mockFunction.mockRestore()
      })
    })
  })

  describe('index', () => {
    describe('response', () => {
      it('returns status 200 and message if user exists', async () => {
        await request(expressServer)
          .get('/resources/users/')
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(Array.isArray(response.body)).toEqual(true)
            expect(response.body.length).toEqual(4)
            expect(response.body[3].name).toEqual('Jonny Walker')
            expect(response.body[3].email).toEqual('jonny@walker.com')
            expect(response.body[3].active).toEqual(true)
            expect(response.body[3]._id).toBeDefined()
            expect(response.body[3]._id).toBeDefined()
            expect(response.body[3].password).not.toBeDefined()
          })
      })

      it('returns status 500 and message if occurs another error', async () => {
        const mockFunction = jest.spyOn(User, 'find').mockImplementation(() => {
          throw new Error('some error')
        })

        await request(expressServer)
          .get('/resources/users/')
          .set('x-access-token', token)
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        mockFunction.mockRestore()
      })
    })
  })
})
