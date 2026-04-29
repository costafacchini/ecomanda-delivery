import { BackgroundjobRepositoryMemory } from '@repositories/backgroundjob'
import { BackgroundjobsController } from './BackgroundjobsController.js'

function buildResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  }
}

function buildController() {
  const backgroundjobRepository = new BackgroundjobRepositoryMemory()
  const scheduleBackgroundjob = { execute: jest.fn() }
  const controller = new BackgroundjobsController({ backgroundjobRepository, scheduleBackgroundjob })
  return { controller, backgroundjobRepository, scheduleBackgroundjob }
}

describe('BackgroundjobsController delegation', () => {
  describe('create', () => {
    it('delegates create to scheduleBackgroundjob and returns status 200', async () => {
      const { controller, scheduleBackgroundjob } = buildController()
      const backgroundjob = { _id: 'job-id' }
      scheduleBackgroundjob.execute.mockResolvedValue(backgroundjob)

      const req = { licensee: { _id: 'licensee-id' }, body: { kind: 'get-pix', payload: { cart_id: 'cart-id' } } }
      const res = buildResponse()

      await controller.create(req, res)

      expect(scheduleBackgroundjob.execute).toHaveBeenCalledWith({
        kind: 'get-pix',
        payload: { cart_id: 'cart-id' },
        licenseeId: 'licensee-id',
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({
        body: { message: 'Job agendado com sucesso.', job_id: 'job-id' },
      })
    })

    it('returns 422 when scheduleBackgroundjob raises model errors', async () => {
      const { controller, scheduleBackgroundjob } = buildController()
      const modelError = { errors: { kind: { message: 'invalid kind' } } }
      scheduleBackgroundjob.execute.mockRejectedValue(modelError)

      const req = { licensee: { _id: 'licensee-id' }, body: { kind: 'bad-kind', payload: {} } }
      const res = buildResponse()

      await controller.create(req, res)

      expect(res.status).toHaveBeenCalledWith(422)
    })

    it('returns 500 when scheduleBackgroundjob throws unexpected error', async () => {
      const { controller, scheduleBackgroundjob } = buildController()
      scheduleBackgroundjob.execute.mockRejectedValue(new Error('unexpected'))

      const req = { licensee: { _id: 'licensee-id' }, body: { kind: 'get-pix', payload: {} } }
      const res = buildResponse()

      await controller.create(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.send).toHaveBeenCalledWith({ body: { message: 'Error: unexpected' } })
    })
  })

  describe('show', () => {
    it('returns 200 with scheduled message when job status is scheduled', async () => {
      const { controller, backgroundjobRepository } = buildController()
      const job = await backgroundjobRepository.create({ status: 'scheduled', licensee: 'licensee-id' })

      const req = { licensee: { _id: 'licensee-id' }, params: { id: job._id } }
      const res = buildResponse()

      await controller.show(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({
        message: 'O job está agendado, mas ainda não está executando. Por favor, volte mais tarde!',
      })
    })

    it('returns 200 with running message when job status is running', async () => {
      const { controller, backgroundjobRepository } = buildController()
      const job = await backgroundjobRepository.create({ status: 'running', licensee: 'licensee-id' })

      const req = { licensee: { _id: 'licensee-id' }, params: { id: job._id } }
      const res = buildResponse()

      await controller.show(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({
        message: 'O job está em execução, logo deve ficar pronto. Por favor, volte daqui a pouco!',
      })
    })

    it('returns 200 with done message and response when job status is done', async () => {
      const { controller, backgroundjobRepository } = buildController()
      const job = await backgroundjobRepository.create({
        status: 'done',
        licensee: 'licensee-id',
        response: { link: 'https://anything.com' },
      })

      const req = { licensee: { _id: 'licensee-id' }, params: { id: job._id } }
      const res = buildResponse()

      await controller.show(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({
        message: 'Eu concljuí a execução e a resposta esta na key chamada response!',
        response: { link: 'https://anything.com' },
      })
    })

    it('returns 200 with error message when job status is error', async () => {
      const { controller, backgroundjobRepository } = buildController()
      const job = await backgroundjobRepository.create({
        status: 'error',
        licensee: 'licensee-id',
        error: 'some error',
      })

      const req = { licensee: { _id: 'licensee-id' }, params: { id: job._id } }
      const res = buildResponse()

      await controller.show(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({ message: 'some error' })
    })

    it('returns 404 when job is not found', async () => {
      const { controller } = buildController()
      const nonExistentId = 'non-existent-job-id'

      const req = { licensee: { _id: 'licensee-id' }, params: { id: nonExistentId } }
      const res = buildResponse()

      await controller.show(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: `Backgroundjob ${nonExistentId} não encontrado` } })
    })

    it('returns 500 when repository throws unexpected error', async () => {
      const backgroundjobRepository = { findFirst: jest.fn().mockRejectedValue(new Error('some error')) }
      const scheduleBackgroundjob = { execute: jest.fn() }
      const controller = new BackgroundjobsController({ backgroundjobRepository, scheduleBackgroundjob })

      const req = { licensee: { _id: 'licensee-id' }, params: { id: 'job-id' } }
      const res = buildResponse()

      await controller.show(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Error: some error' } })
    })
  })
})
