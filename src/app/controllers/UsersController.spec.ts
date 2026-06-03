import { UserRepositoryMemory } from '@repositories/user'
import { UsersController } from './UsersController'

function buildResponse() {
  return {
    json: jest.fn(),
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  }
}

async function runValidations(controller, req) {
  const validations = controller.validations()

  for (const validation of validations) {
    await validation.run(req)
  }
}

function buildController() {
  const userRepository = new UserRepositoryMemory()
  const createUser = {
    execute: jest.fn(),
  }
  const updateUser = {
    execute: jest.fn(),
  }

  const controller = new UsersController({
    userRepository,
    createUser,
    updateUser,
  })

  return {
    controller,
    userRepository,
    createUser,
    updateUser,
  }
}

describe('UsersController delegation', () => {
  const invalidEmailResponse = {
    errors: [{ message: 'Email deve ser preenchido com um valor válido' }],
  }
  const modelErrorResponse = {
    errors: [{ message: 'Nome: Você deve preencher o campo' }],
  }

  it('delegates create to the createUser use case and returns status 201', async () => {
    const { controller, createUser } = buildController()
    const req = {
      body: {
        name: 'Mary Jane',
        email: 'mary@jane.com',
        password: '12345678',
        active: true,
        licensee: 'licensee-id',
        role: 'admin',
      },
    }
    const res = buildResponse()

    createUser.execute.mockResolvedValue({ _id: 'user-id' })

    await controller.create(req, res)

    expect(createUser.execute).toHaveBeenCalledWith(req.body)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.send).toHaveBeenCalledWith({
      _id: 'user-id',
      name: 'Mary Jane',
      email: 'mary@jane.com',
      active: true,
      licensee: 'licensee-id',
      role: 'admin',
    })
  })

  it('delegates update to the updateUser use case and returns status 200', async () => {
    const { controller, updateUser } = buildController()
    const req = {
      params: { id: 'user-id' },
      body: {
        name: 'Bruno Mars',
        email: 'bruno@mars.com',
        password: '87654321',
        active: false,
      },
    }
    const res = buildResponse()

    updateUser.execute.mockResolvedValue({
      _id: 'user-id',
      name: 'Bruno Mars',
      email: 'bruno@mars.com',
      active: false,
      password: 'hidden',
    })

    await controller.update(req, res)

    expect(updateUser.execute).toHaveBeenCalledWith('user-id', req.body)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith({
      _id: 'user-id',
      name: 'Bruno Mars',
      email: 'bruno@mars.com',
      active: false,
    })
  })

  it('delegates show to userRepository.findFirst by _id and returns status 200', async () => {
    const { controller, userRepository } = buildController()
    const seeded = await userRepository.create({
      name: 'John Doe',
      email: 'john@doe.com',
      password: 'password123',
      licensee: '507f1f77bcf86cd799439011',
    })

    const req = { params: { id: seeded._id.toString() } }
    const res = buildResponse()

    await controller.show(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ name: 'John Doe', email: 'john@doe.com' }))
  })

  it('delegates show to userRepository.findFirst by email when id contains @', async () => {
    const { controller, userRepository } = buildController()
    await userRepository.create({
      name: 'John Doe',
      email: 'john@doe.com',
      password: 'password123',
      licensee: '507f1f77bcf86cd799439011',
    })

    const req = { params: { id: 'john@doe.com' } }
    const res = buildResponse()

    await controller.show(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ name: 'John Doe', email: 'john@doe.com' }))
  })

  it('returns 404 from show when id cast fails', async () => {
    const userRepository = {
      findFirst: jest
        .fn()
        .mockRejectedValue(
          Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError', kind: 'ObjectId' }),
        ),
      find: jest.fn(),
    }
    const controller = new UsersController({
      userRepository,
      createUser: { execute: jest.fn() },
      updateUser: { execute: jest.fn() },
    })

    const req = { params: { id: 'bad' } }
    const res = buildResponse()

    await controller.show(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Usuário não encontrado' } })
  })

  it('delegates index to userRepository.find and returns status 200', async () => {
    const { controller, userRepository } = buildController()
    await userRepository.create({
      name: 'John Doe',
      email: 'john@doe.com',
      password: 'password123',
      licensee: '507f1f77bcf86cd799439011',
    })

    const req = { query: {} }
    const res = buildResponse()

    await controller.index(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ name: 'John Doe', email: 'john@doe.com' })]),
    )
  })

  it.each([
    ['create', 'createUser', { body: { email: 'maryjane.com' } }],
    ['update', 'updateUser', { params: { id: 'user-id' }, body: { email: 'brunomars.com' } }],
  ])(
    'returns status 422 when %s validation fails before delegating to the use case',
    async (method, dependency, req) => {
      const dependencies = buildController()
      const res = buildResponse()

      await runValidations(dependencies.controller, req)
      await dependencies.controller[method](req, res)

      expect(dependencies[dependency].execute).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.json).toHaveBeenCalledWith(invalidEmailResponse)
    },
  )

  it.each([
    ['create', 'createUser', { body: { email: 'mary@jane.com' } }],
    ['update', 'updateUser', { params: { id: 'user-id' }, body: { name: '' } }],
  ])('returns status 422 when %s use case raises model validation errors', async (method, dependency, req) => {
    const dependencies = buildController()
    const res = buildResponse()

    dependencies[dependency].execute.mockRejectedValue({
      errors: {
        name: { message: 'Nome: Você deve preencher o campo' },
      },
    })

    await dependencies.controller[method](req, res)

    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.json).toHaveBeenCalledWith(modelErrorResponse)
  })

  it.each([
    ['create', 'createUser', { body: { name: 'Mary Jane', email: 'mary@jane.com' } }],
    ['update', 'updateUser', { params: { id: 'user-id' }, body: { name: 'Bruno Mars' } }],
  ])('returns status 500 when %s use case throws an unexpected error', async (method, dependency, req) => {
    const dependencies = buildController()
    const res = buildResponse()

    dependencies[dependency].execute.mockRejectedValue(new Error('some error'))

    await dependencies.controller[method](req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.send).toHaveBeenCalledWith({
      errors: { message: 'Erro interno do servidor: some error' },
    })
  })
})
