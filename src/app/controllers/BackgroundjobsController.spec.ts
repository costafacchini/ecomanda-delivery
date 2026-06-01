import { BackgroundjobsController } from './BackgroundjobsController'

function buildResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  }
}

function buildController() {
  const scheduleBackgroundjob = { execute: jest.fn() }
  const getBackgroundjobStatus = { execute: jest.fn() }
  const controller = new BackgroundjobsController({ scheduleBackgroundjob, getBackgroundjobStatus })
  return { controller, scheduleBackgroundjob, getBackgroundjobStatus }
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
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Erro interno do servidor: unexpected' } })
    })
  })

  describe('show', () => {
    it('delegates show to getBackgroundjobStatus and returns 200 with result', async () => {
      const { controller, getBackgroundjobStatus } = buildController()
      getBackgroundjobStatus.execute.mockResolvedValue({
        message: 'O job está agendado, mas ainda não está executando. Por favor, volte mais tarde!',
      })

      const req = { licensee: { _id: 'licensee-id' }, params: { id: 'job-id' } }
      const res = buildResponse()

      await controller.show(req, res)

      expect(getBackgroundjobStatus.execute).toHaveBeenCalledWith({ jobId: 'job-id', licenseeId: 'licensee-id' })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({
        message: 'O job está agendado, mas ainda não está executando. Por favor, volte mais tarde!',
      })
    })

    it('returns 404 when getBackgroundjobStatus returns null', async () => {
      const { controller, getBackgroundjobStatus } = buildController()
      getBackgroundjobStatus.execute.mockResolvedValue(null)

      const req = { licensee: { _id: 'licensee-id' }, params: { id: 'non-existent-job-id' } }
      const res = buildResponse()

      await controller.show(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.send).toHaveBeenCalledWith({
        errors: { message: 'Backgroundjob non-existent-job-id não encontrado' },
      })
    })

    it('returns 404 when id cast fails', async () => {
      const { controller, getBackgroundjobStatus } = buildController()
      getBackgroundjobStatus.execute.mockRejectedValue(
        Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError', kind: 'ObjectId' }),
      )

      const req = { licensee: { _id: 'licensee-id' }, params: { id: 'bad' } }
      const res = buildResponse()

      await controller.show(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Backgroundjob bad não encontrado' } })
    })

    it('returns 500 when getBackgroundjobStatus throws unexpected error', async () => {
      const { controller, getBackgroundjobStatus } = buildController()
      getBackgroundjobStatus.execute.mockRejectedValue(new Error('some error'))

      const req = { licensee: { _id: 'licensee-id' }, params: { id: 'job-id' } }
      const res = buildResponse()

      await controller.show(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.send).toHaveBeenCalledWith({ errors: { message: 'Erro interno do servidor: some error' } })
    })
  })
})
