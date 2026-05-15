import { triggerMultiProduct as triggerFactory } from '@factories/trigger'
import { TriggerRepositoryMemory } from '@repositories/trigger'
import { TriggersController } from './TriggersController.js'

function buildResponse() {
  return {
    json: jest.fn(),
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  }
}

function buildController() {
  const triggerRepository = new TriggerRepositoryMemory()
  const triggersQueryInstance = {
    page: jest.fn(),
    limit: jest.fn(),
    filterByKind: jest.fn(),
    filterByLicensee: jest.fn(),
    filterByExpression: jest.fn(),
    all: jest.fn(),
  }
  const createTriggersQuery = jest.fn().mockReturnValue(triggersQueryInstance)
  const createTrigger = {
    execute: jest.fn(),
  }
  const updateTrigger = {
    execute: jest.fn(),
  }
  const importFacebookCatalog = {
    execute: jest.fn(),
  }

  const controller = new TriggersController({
    triggerRepository,
    createTriggersQuery,
    createTrigger,
    updateTrigger,
    importFacebookCatalog,
  })

  return {
    controller,
    triggerRepository,
    createTriggersQuery,
    triggersQueryInstance,
    createTrigger,
    updateTrigger,
    importFacebookCatalog,
  }
}

describe('TriggersController delegation', () => {
  const modelErrorResponse = {
    errors: [{ message: 'Expressão: Você deve preencher o campo' }],
  }

  it('delegates create to the createTrigger use case and returns status 201', async () => {
    const { controller, createTrigger } = buildController()
    const req = {
      body: triggerFactory.build({
        licensee: 'licensee-id',
      }),
    }
    const res = buildResponse()
    const trigger = { _id: 'trigger-id', name: 'Send multi products' }

    createTrigger.execute.mockResolvedValue(trigger)

    await controller.create(req, res)

    expect(createTrigger.execute).toHaveBeenCalledWith(req.body)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.send).toHaveBeenCalledWith(trigger)
  })

  it('delegates update to the updateTrigger use case and returns status 200', async () => {
    const { controller, updateTrigger } = buildController()
    const req = {
      params: { id: 'trigger-id' },
      body: {
        name: 'Another',
        triggerKind: 'single_product',
        expression: 'single',
        catalogSingle: 'single catalog',
        licensee: 'licensee-id',
      },
    }
    const res = buildResponse()
    const trigger = {
      _id: 'trigger-id',
      name: 'Another',
      triggerKind: 'single_product',
      expression: 'single',
      catalogSingle: 'single catalog',
      licensee: 'licensee-id',
    }

    updateTrigger.execute.mockResolvedValue(trigger)

    await controller.update(req, res)

    expect(updateTrigger.execute).toHaveBeenCalledWith('trigger-id', req.body)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith(trigger)
  })

  it('delegates show to triggerRepository.findFirst and returns status 200', async () => {
    const { controller, triggerRepository } = buildController()
    const seeded = await triggerRepository.create({ name: 'Send multi products' })

    const req = { params: { id: seeded._id } }
    const res = buildResponse()

    await controller.show(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ name: 'Send multi products' }))
  })

  it('returns 404 from show when id cast fails', async () => {
    const triggerRepository = {
      findFirst: jest
        .fn()
        .mockRejectedValue(
          Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError', kind: 'ObjectId' }),
        ),
    }
    const triggersQueryInstance = {
      page: jest.fn(),
      limit: jest.fn(),
      filterByKind: jest.fn(),
      filterByLicensee: jest.fn(),
      filterByExpression: jest.fn(),
      all: jest.fn(),
    }
    const controller = new TriggersController({
      triggerRepository,
      createTriggersQuery: jest.fn().mockReturnValue(triggersQueryInstance),
      createTrigger: { execute: jest.fn() },
      updateTrigger: { execute: jest.fn() },
      importFacebookCatalog: { execute: jest.fn() },
    })

    const req = { params: { id: 'bad' } }
    const res = buildResponse()

    await controller.show(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Trigger bad não encontrada' } })
  })

  it('delegates index to triggersQuery and returns status 200', async () => {
    const { controller, triggersQueryInstance } = buildController()
    const triggers = [{ _id: 'trigger-id' }]
    triggersQueryInstance.all.mockResolvedValue(triggers)

    const req = { query: { page: '1', limit: '3', expression: 'send' } }
    const res = buildResponse()

    await controller.index(req, res)

    expect(triggersQueryInstance.page).toHaveBeenCalledWith('1')
    expect(triggersQueryInstance.limit).toHaveBeenCalledWith('3')
    expect(triggersQueryInstance.filterByExpression).toHaveBeenCalledWith('send')
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith(triggers)
  })

  it.each([
    ['create', 'createTrigger', { body: { expression: '' } }],
    ['update', 'updateTrigger', { params: { id: 'trigger-id' }, body: { expression: '' } }],
  ])('returns status 422 when %s use case raises model validation errors', async (method, dependency, req) => {
    const dependencies = buildController()
    const res = buildResponse()

    dependencies[dependency].execute.mockRejectedValue({
      errors: {
        expression: { message: 'Expressão: Você deve preencher o campo' },
      },
    })

    await dependencies.controller[method](req, res)

    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.json).toHaveBeenCalledWith(modelErrorResponse)
  })

  it.each([
    ['create', 'createTrigger', { body: triggerFactory.build({ licensee: 'licensee-id' }) }],
    ['update', 'updateTrigger', { params: { id: 'trigger-id' }, body: { name: 'Name modified' } }],
    ['importation', 'importFacebookCatalog', { params: { id: 'trigger-id' }, body: { text: 'catalog-data' } }],
  ])('returns status 500 when %s use case throws an unexpected error', async (method, dependency, req) => {
    const dependencies = buildController()
    const res = buildResponse()

    dependencies[dependency].execute.mockRejectedValue(new Error('some error'))

    await dependencies.controller[method](req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.send).toHaveBeenCalledWith({
      errors: { message: 'Erro interno do servidor.' },
    })
  })

  it('delegates importation to the importFacebookCatalog use case and returns status 201', async () => {
    const { controller, importFacebookCatalog } = buildController()
    const req = {
      params: { id: 'trigger-id' },
      body: { text: 'catalog-data' },
    }
    const res = buildResponse()

    importFacebookCatalog.execute.mockResolvedValue(undefined)

    await controller.importation(req, res)

    expect(importFacebookCatalog.execute).toHaveBeenCalledWith('trigger-id', 'catalog-data')
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.send).toHaveBeenCalledWith({ body: 'OK' })
  })
})
