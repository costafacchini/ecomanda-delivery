import Backgroundjob from '../models/Backgroundjob.js'
import { queueServer } from '../../config/queue.js'
import { sanitizeModelErrors } from '../helpers/SanitizeErrors.js'

class BackgroundjobsController {
  async create(req, res) {
    const { kind, payload } = req.body

    const backgroundjob = new Backgroundjob({
      kind,
      body: payload,
      licensee: req.licensee._id,
    })

    const validation = backgroundjob.validateSync()

    try {
      if (validation) {
        return res.status(422).send({ errors: sanitizeModelErrors(validation.errors) })
      } else {
        await backgroundjob.save()
      }

      await queueServer.addJob('background-job', { jobId: backgroundjob._id.toString() })

      res.status(200).send({
        body: {
          message: 'Job agendado com sucesso.',
          job_id: backgroundjob._id,
        },
      })
    } catch (err) {
      res.status(500).send({ body: { message: err.toString() } })
    }
  }

  async show(req, res) {
    try {
      const backgroundjob = await Backgroundjob.findOne({ _id: req.params.id, licensee: req.licensee._id })

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
