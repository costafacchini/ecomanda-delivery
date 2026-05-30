import { sanitizeModelErrors } from '../helpers/SanitizeErrors'

class BackgroundjobsController {
  scheduleBackgroundjob: any
  getBackgroundjobStatus: any

  constructor({ scheduleBackgroundjob, getBackgroundjobStatus }: Record<string, any> = {}) {
    this.scheduleBackgroundjob = scheduleBackgroundjob
    this.getBackgroundjobStatus = getBackgroundjobStatus

    this.create = this.create.bind(this)
    this.show = this.show.bind(this)
  }

  async create(req: any, res: any) {
    const { kind, payload } = req.body

    try {
      const backgroundjob = await this.scheduleBackgroundjob.execute({
        kind,
        payload,
        licenseeId: req.licensee._id,
      })

      res.status(200).send({
        body: {
          message: 'Job agendado com sucesso.',
          job_id: backgroundjob._id,
        },
      })
    } catch (err) {
      if ('errors' in err) {
        return res.status(422).send({ errors: sanitizeModelErrors(err.errors) })
      }
      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async show(req: any, res: any) {
    try {
      const result = await this.getBackgroundjobStatus.execute({
        jobId: req.params.id,
        licenseeId: req.licensee._id,
      })

      if (!result) return res.status(404).send({ errors: { message: `Backgroundjob ${req.params.id} não encontrado` } })

      res.status(200).send(result)
    } catch (err) {
      if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(404).send({ errors: { message: `Backgroundjob ${req.params.id} não encontrado` } })
      }
      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }
}

export { BackgroundjobsController }
