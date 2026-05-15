import { TemplateRepositoryMemory } from '@repositories/template'
import { TemplatesController } from './TemplatesController.js'

function buildResponse() {
  return {
    json: jest.fn(),
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  }
}

function buildController() {
  const templateRepository = new TemplateRepositoryMemory()
  const templatesQueryInstance = {
    page: jest.fn(),
    limit: jest.fn(),
    filterByLicensee: jest.fn(),
    filterByExpression: jest.fn(),
    all: jest.fn(),
  }
  const createTemplatesQuery = jest.fn().mockReturnValue(templatesQueryInstance)
  const templateImporterInstance = { import: jest.fn() }
  const createTemplatesImporter = jest.fn().mockReturnValue(templateImporterInstance)

  const controller = new TemplatesController({
    templateRepository,
    createTemplatesQuery,
    createTemplatesImporter,
  })

  return {
    controller,
    templateRepository,
    createTemplatesQuery,
    templatesQueryInstance,
    createTemplatesImporter,
    templateImporterInstance,
  }
}

describe('TemplatesController delegation', () => {
  it('creates a template and returns status 201', async () => {
    const { controller } = buildController()

    const req = { body: { name: 'template', namespace: 'Namespace', licensee: 'licensee-id' } }
    const res = buildResponse()

    await controller.create(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'template', namespace: 'Namespace', licensee: 'licensee-id' }),
    )
  })

  it('returns 422 when create raises model validation errors', async () => {
    const templateRepository = {
      create: jest.fn().mockRejectedValue({ errors: { name: { message: 'Nome: Você deve preencher o campo' } } }),
      update: jest.fn(),
      findFirst: jest.fn(),
    }
    const controller = new TemplatesController({
      templateRepository,
      createTemplatesQuery: jest.fn(),
      createTemplatesImporter: jest.fn(),
    })

    const req = { body: { name: '', namespace: 'Namespace', licensee: 'licensee-id' } }
    const res = buildResponse()

    await controller.create(req, res)

    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.json).toHaveBeenCalledWith({ errors: [{ message: 'Nome: Você deve preencher o campo' }] })
  })

  it('returns 500 when create throws unexpected error', async () => {
    const templateRepository = {
      create: jest.fn().mockRejectedValue(new Error('some error')),
      update: jest.fn(),
      findFirst: jest.fn(),
    }
    const controller = new TemplatesController({
      templateRepository,
      createTemplatesQuery: jest.fn(),
      createTemplatesImporter: jest.fn(),
    })

    const req = { body: { name: 'template', namespace: 'Namespace', licensee: 'licensee-id' } }
    const res = buildResponse()

    await controller.create(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Erro interno do servidor.' } })
  })

  it('updates a template and returns status 200', async () => {
    const { controller, templateRepository } = buildController()
    const seeded = await templateRepository.create({
      name: 'original',
      namespace: 'Other',
      licensee: 'licensee-id',
    })

    const req = {
      params: { id: seeded._id },
      body: { name: 'another', namespace: 'Other', licensee: 'other-licensee-id' },
    }
    const res = buildResponse()

    await controller.update(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ name: 'another', namespace: 'Other' }))
  })

  it('returns 422 when update raises model validation errors', async () => {
    const templateRepository = {
      create: jest.fn(),
      update: jest.fn().mockRejectedValue({ errors: { name: { message: 'Nome: Você deve preencher o campo' } } }),
      findFirst: jest.fn(),
    }
    const controller = new TemplatesController({
      templateRepository,
      createTemplatesQuery: jest.fn(),
      createTemplatesImporter: jest.fn(),
    })

    const req = { params: { id: 'template-id' }, body: { name: '' } }
    const res = buildResponse()

    await controller.update(req, res)

    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.json).toHaveBeenCalledWith({ errors: [{ message: 'Nome: Você deve preencher o campo' }] })
  })

  it('returns 500 when update findFirst throws unexpected error', async () => {
    const templateRepository = {
      create: jest.fn(),
      update: jest.fn().mockResolvedValue(),
      findFirst: jest.fn().mockRejectedValue(new Error('some error')),
    }
    const controller = new TemplatesController({
      templateRepository,
      createTemplatesQuery: jest.fn(),
      createTemplatesImporter: jest.fn(),
    })

    const req = { params: { id: 'template-id' }, body: { name: 'Name modified' } }
    const res = buildResponse()

    await controller.update(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Erro interno do servidor.' } })
  })

  it('returns template on show and status 200', async () => {
    const { controller, templateRepository } = buildController()
    const seeded = await templateRepository.create({ name: 'name', namespace: 'test', licensee: 'licensee-id' })

    const req = { params: { id: seeded._id } }
    const res = buildResponse()

    await controller.show(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ name: 'name', namespace: 'test' }))
  })

  it('returns 404 when show id cast fails', async () => {
    const templateRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest
        .fn()
        .mockRejectedValue(
          Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError', kind: 'ObjectId' }),
        ),
    }
    const controller = new TemplatesController({
      templateRepository,
      createTemplatesQuery: jest.fn(),
      createTemplatesImporter: jest.fn(),
    })

    const req = { params: { id: 'bad' } }
    const res = buildResponse()

    await controller.show(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Template bad não encontrado' } })
  })

  it('delegates index to templatesQuery and returns status 200', async () => {
    const { controller, templatesQueryInstance } = buildController()
    const templates = [{ _id: 'template-id', name: 'template' }]
    templatesQueryInstance.all.mockResolvedValue(templates)

    const req = { query: { page: '1', limit: '3', expression: 'template' } }
    const res = buildResponse()

    await controller.index(req, res)

    expect(templatesQueryInstance.page).toHaveBeenCalledWith('1')
    expect(templatesQueryInstance.limit).toHaveBeenCalledWith('3')
    expect(templatesQueryInstance.filterByExpression).toHaveBeenCalledWith('template')
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith(templates)
  })

  it('delegates importation to templateImporter and returns status 201', async () => {
    const { controller, createTemplatesImporter, templateImporterInstance } = buildController()
    templateImporterInstance.import.mockResolvedValue()

    const req = { params: { id: 'licensee-id' } }
    const res = buildResponse()

    await controller.importation(req, res)

    expect(createTemplatesImporter).toHaveBeenCalledWith('licensee-id')
    expect(templateImporterInstance.import).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.send).toHaveBeenCalledWith({ body: 'OK' })
  })

  it('returns 500 when importation throws unexpected error', async () => {
    const { controller, templateImporterInstance } = buildController()
    templateImporterInstance.import.mockRejectedValue(new Error('some error'))

    const req = { params: { id: 'licensee-id' } }
    const res = buildResponse()

    await controller.importation(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Erro interno do servidor.' } })
  })
})
