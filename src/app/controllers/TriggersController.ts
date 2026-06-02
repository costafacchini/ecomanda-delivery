import { sanitizeModelErrors } from '../helpers/SanitizeErrors'

class TriggersController {
  triggerRepository: any
  createTriggersQuery: any
  createTrigger: any
  updateTrigger: any
  constructor({
    triggerRepository,
    createTriggersQuery,
    createTrigger,
    updateTrigger,
  }: Record<string, any> = {}) {
    this.triggerRepository = triggerRepository
    this.createTriggersQuery = createTriggersQuery
    this.createTrigger = createTrigger
    this.updateTrigger = updateTrigger

    this.create = this.create.bind(this)
    this.update = this.update.bind(this)
    this.show = this.show.bind(this)
    this.index = this.index.bind(this)
  }

  async create(req: any, res: any) {
    try {
      const trigger = await this.createTrigger.execute(req.body)

      return res.status(201).send(trigger)
    } catch (err: any) {
      if ('errors' in err) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }

      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async update(req: any, res: any) {
    try {
      const trigger = await this.updateTrigger.execute(req.params.id, req.body)

      return res.status(200).send(trigger)
    } catch (err: any) {
      if ('errors' in err) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }

      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async show(req: any, res: any) {
    try {
      const trigger = await this.triggerRepository.findFirst({ _id: req.params.id }, ['licensee'])

      res.status(200).send(trigger)
    } catch (err: any) {
      if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(404).send({ errors: { message: `Trigger ${req.params.id} não encontrada` } })
      } else {
        return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
      }
    }
  }

  async index(req: any, res: any) {
    try {
      const page = req.query.page || 1
      const limit = req.query.limit || 30

      const triggersQuery = this.createTriggersQuery()

      triggersQuery.page(page)
      triggersQuery.limit(limit)

      if (req.query.kind) {
        triggersQuery.filterByKind(req.query.type)
      }

      if (req.query.licensee) {
        triggersQuery.filterByLicensee(req.query.licensee)
      }

      if (req.query.expression) {
        triggersQuery.filterByExpression(req.query.expression)
      }

      const triggers = await triggersQuery.all()

      res.status(200).send(triggers)
    } catch (err: any) {
      res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

}

export { TriggersController }
