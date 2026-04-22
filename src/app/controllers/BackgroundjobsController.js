import { sanitizeModelErrors } from '../helpers/SanitizeErrors.js'

class BackgroundjobsController {
  constructor({ backgroundjobRepository, queueServer } = {}) {
    this.backgroundjobRepository = backgroundjobRepository
    this.queueServer = queueServer

    this.create = this.create.bind(this)
    this.show = this.show.bind(this)
  }

  async create(req, res) {
    const { kind, payload } = req.body

    try {
      const backgroundjob = await this.backgroundjobRepository.create({
        kind,
        body: payload,
        licensee: req.licensee._id,
      })

      await this.queueServer.addJob('background-job', {
        jobId: backgroundjob._id.toString(),
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
      res.status(500).send({ body: { message: err.toString() } })
    }
  }

  async show(req, res) {
    try {
      const backgroundjob = await this.backgroundjobRepository.findFirst({
        _id: req.params.id,
        licensee: req.licensee._id,
      })

      if (!backgroundjob)
        return res.status(404).send({ errors: { message: `Backgroundjob ${req.params.id} não encontrado` } })

      if (backgroundjob.status == 'scheduled') {
        res.status(200).send({
          message: 'O job está agendado, mas ainda não está executando. Por favor, volte mais tarde!',
        })
      }

      if (backgroundjob.status == 'running') {
        res.status(200).send({
          message: 'O job está em execução, logo deve ficar pronto. Por favor, volte daqui a pouco!',
        })
      }

      if (backgroundjob.status == 'done') {
        res.status(200).send({
          message: 'Eu concljuí a execução e a resposta esta na key chamada response!',
          response: backgroundjob.response,
        })
      }

      if (backgroundjob.status == 'error') {
        res.status(200).send({
          message: backgroundjob.error,
        })
      }
    } catch (err) {
      if (err.toString().includes('Cast to ObjectId failed for value')) {
        return res.status(404).send({ errors: { message: `Backgroundjob ${req.params.id} não encontrado` } })
      } else {
        return res.status(500).send({ errors: { message: err.toString() } })
      }
    }
  }
}

export { BackgroundjobsController }
