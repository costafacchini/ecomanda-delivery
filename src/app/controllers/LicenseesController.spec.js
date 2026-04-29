import { LicenseeRepositoryMemory } from '@repositories/licensee'
import { LicenseesController } from './LicenseesController.js'
import { WEBHOOK_CONFIGURED_MESSAGE } from '../usecases/licensees/SetDialogWebhook.js'
import { LICENSEE_SENT_TO_PAGARME_MESSAGE } from '../usecases/licensees/SendLicenseeToPagarMe.js'
import { WEBHOOK_NOT_SIGNED_MESSAGE, WEBHOOK_SIGNED_MESSAGE } from '../usecases/licensees/SignPedidos10OrderWebhook.js'

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
  const licenseeRepository = new LicenseeRepositoryMemory()
  const licenseesQueryInstance = {
    page: jest.fn(),
    limit: jest.fn(),
    filterByChatDefault: jest.fn(),
    filterByChatbotDefault: jest.fn(),
    filterByWhatsappDefault: jest.fn(),
    filterByExpression: jest.fn(),
    filterByActive: jest.fn(),
    filterByPedidos10Active: jest.fn(),
    all: jest.fn(),
  }
  const createLicenseesQuery = jest.fn().mockReturnValue(licenseesQueryInstance)
  const createLicensee = {
    execute: jest.fn(),
  }
  const updateLicensee = {
    execute: jest.fn(),
  }
  const setDialogWebhook = {
    execute: jest.fn(),
  }
  const sendLicenseeToPagarMe = {
    execute: jest.fn(),
  }
  const signPedidos10OrderWebhook = {
    execute: jest.fn(),
  }

  const controller = new LicenseesController({
    licenseeRepository,
    createLicenseesQuery,
    createLicensee,
    updateLicensee,
    setDialogWebhook,
    sendLicenseeToPagarMe,
    signPedidos10OrderWebhook,
  })

  return {
    controller,
    licenseeRepository,
    createLicenseesQuery,
    licenseesQueryInstance,
    createLicensee,
    updateLicensee,
    setDialogWebhook,
    sendLicenseeToPagarMe,
    signPedidos10OrderWebhook,
  }
}

describe('LicenseesController delegation', () => {
  it('delegates create to the createLicensee use case and returns status 201', async () => {
    const { controller, createLicensee } = buildController()
    const req = {
      body: {
        name: 'Alcateia Ltds',
        email: 'alcateia@alcateia.com',
        pedidos10_integration: JSON.stringify({ username: 'alcateia' }),
      },
    }
    const res = buildResponse()
    const licensee = { _id: 'licensee-id', name: 'Alcateia Ltds' }

    createLicensee.execute.mockResolvedValue(licensee)

    await controller.create(req, res)

    expect(createLicensee.execute).toHaveBeenCalledWith(req.body)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.send).toHaveBeenCalledWith(licensee)
  })

  it('returns status 422 when create validation fails before delegating to the use case', async () => {
    const { controller, createLicensee } = buildController()
    const req = {
      body: { email: 'emailinvalid.com' },
    }
    const res = buildResponse()

    await runValidations(controller, req)
    await controller.create(req, res)

    expect(createLicensee.execute).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.json).toHaveBeenCalledWith({
      errors: [{ message: 'Email deve ser preenchido com um valor válido' }],
    })
  })

  it('returns status 422 when createLicensee raises model validation errors', async () => {
    const { controller, createLicensee } = buildController()
    const req = {
      body: { name: '', email: 'alcateia@alcateia.com' },
    }
    const res = buildResponse()

    createLicensee.execute.mockRejectedValue({
      errors: {
        name: { message: 'Nome: Você deve preencher o campo' },
      },
    })

    await controller.create(req, res)

    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.json).toHaveBeenCalledWith({
      errors: [{ message: 'Nome: Você deve preencher o campo' }],
    })
  })

  it('returns status 500 when createLicensee throws an unexpected error', async () => {
    const { controller, createLicensee } = buildController()
    const req = {
      body: { name: 'Alcateia Ltds', email: 'alcateia@alcateia.com' },
    }
    const res = buildResponse()

    createLicensee.execute.mockRejectedValue(new Error('some error'))

    await controller.create(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.send).toHaveBeenCalledWith({
      errors: { message: 'Error: some error' },
    })
  })

  it('delegates update to the updateLicensee use case and returns status 200', async () => {
    const { controller, updateLicensee } = buildController()
    const req = {
      params: { id: 'licensee-id' },
      body: {
        name: 'Name modified',
        email: 'modified@alcateia.com',
        pedidos10_integration: JSON.stringify({ username: 'modified' }),
      },
    }
    const res = buildResponse()
    const licensee = { _id: 'licensee-id', name: 'Name modified' }

    updateLicensee.execute.mockResolvedValue(licensee)

    await controller.update(req, res)

    expect(updateLicensee.execute).toHaveBeenCalledWith('licensee-id', req.body)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith(licensee)
  })

  it('returns status 422 when update validation fails before delegating to the use case', async () => {
    const { controller, updateLicensee } = buildController()
    const req = {
      params: { id: 'licensee-id' },
      body: { email: 'modifiedalcateia.com' },
    }
    const res = buildResponse()

    await runValidations(controller, req)
    await controller.update(req, res)

    expect(updateLicensee.execute).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.json).toHaveBeenCalledWith({
      errors: [{ message: 'Email deve ser preenchido com um valor válido' }],
    })
  })

  it('returns status 422 when updateLicensee raises model validation errors', async () => {
    const { controller, updateLicensee } = buildController()
    const req = {
      params: { id: 'licensee-id' },
      body: { name: '' },
    }
    const res = buildResponse()

    updateLicensee.execute.mockRejectedValue({
      errors: {
        name: { message: 'Nome: Você deve preencher o campo' },
      },
    })

    await controller.update(req, res)

    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.json).toHaveBeenCalledWith({
      errors: [{ message: 'Nome: Você deve preencher o campo' }],
    })
  })

  it('returns status 500 when updateLicensee throws an unexpected error', async () => {
    const { controller, updateLicensee } = buildController()
    const req = {
      params: { id: 'licensee-id' },
      body: { name: 'Name modified' },
    }
    const res = buildResponse()

    updateLicensee.execute.mockRejectedValue(new Error('some error'))

    await controller.update(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.send).toHaveBeenCalledWith({
      errors: { message: 'Error: some error' },
    })
  })

  it('delegates show to licenseeRepository.findFirst and returns status 200', async () => {
    const { controller, licenseeRepository } = buildController()
    const seeded = await licenseeRepository.create({
      name: 'Alcateia',
      pedidos10_integration: { username: 'alcateia' },
    })

    const req = { params: { id: seeded._id } }
    const res = buildResponse()

    await controller.show(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ pedidos10_integration: '{"username":"alcateia"}' }),
    )
  })

  it('delegates index to licenseesQuery and returns status 200', async () => {
    const { controller, licenseesQueryInstance } = buildController()
    const licensees = [{ _id: 'licensee-id' }]
    licenseesQueryInstance.all.mockResolvedValue(licensees)

    const req = { query: { page: '1', limit: '3', expression: 'Alca' } }
    const res = buildResponse()

    await controller.index(req, res)

    expect(licenseesQueryInstance.page).toHaveBeenCalledWith('1')
    expect(licenseesQueryInstance.limit).toHaveBeenCalledWith('3')
    expect(licenseesQueryInstance.filterByExpression).toHaveBeenCalledWith('Alca')
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith(licensees)
  })

  it('delegates setDialogWebhook to the use case and returns status 200', async () => {
    const { controller, setDialogWebhook } = buildController()
    const req = {
      params: { id: 'licensee-id' },
    }
    const res = buildResponse()

    setDialogWebhook.execute.mockResolvedValue({ message: WEBHOOK_CONFIGURED_MESSAGE })

    await controller.setDialogWebhook(req, res)

    expect(setDialogWebhook.execute).toHaveBeenCalledWith('licensee-id')
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith({ message: WEBHOOK_CONFIGURED_MESSAGE })
  })

  it('delegates sendToPagarMe to the use case and returns status 200', async () => {
    const { controller, sendLicenseeToPagarMe } = buildController()
    const req = {
      params: { id: 'licensee-id' },
    }
    const res = buildResponse()

    sendLicenseeToPagarMe.execute.mockResolvedValue({
      message: LICENSEE_SENT_TO_PAGARME_MESSAGE,
    })

    await controller.sendToPagarMe(req, res)

    expect(sendLicenseeToPagarMe.execute).toHaveBeenCalledWith('licensee-id')
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith({
      message: LICENSEE_SENT_TO_PAGARME_MESSAGE,
    })
  })

  it('delegates signOrderWebhook to the use case and returns status 200', async () => {
    const { controller, signPedidos10OrderWebhook } = buildController()
    const req = {
      params: { id: 'licensee-id' },
    }
    const res = buildResponse()

    signPedidos10OrderWebhook.execute.mockResolvedValue({ message: WEBHOOK_SIGNED_MESSAGE })

    await controller.signOrderWebhook(req, res)

    expect(signPedidos10OrderWebhook.execute).toHaveBeenCalledWith('licensee-id')
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith({ message: WEBHOOK_SIGNED_MESSAGE })
  })

  it('returns the unsigned webhook message from the signOrderWebhook use case', async () => {
    const { controller, signPedidos10OrderWebhook } = buildController()
    const req = {
      params: { id: 'licensee-id' },
    }
    const res = buildResponse()

    signPedidos10OrderWebhook.execute.mockResolvedValue({
      message: WEBHOOK_NOT_SIGNED_MESSAGE,
    })

    await controller.signOrderWebhook(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith({
      message: WEBHOOK_NOT_SIGNED_MESSAGE,
    })
  })

  it('returns status 500 when an external-action use case throws an unexpected error', async () => {
    const { controller, setDialogWebhook } = buildController()
    const req = {
      params: { id: 'licensee-id' },
    }
    const res = buildResponse()

    setDialogWebhook.execute.mockRejectedValue(new Error('some error'))

    await controller.setDialogWebhook(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.send).toHaveBeenCalledWith({
      errors: { message: 'Error: some error' },
    })
  })
})
