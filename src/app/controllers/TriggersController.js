import { sanitizeModelErrors } from '../helpers/SanitizeErrors.js'

class TriggersController {
  constructor({ triggerRepository, createTriggersQuery, createTrigger, updateTrigger, importFacebookCatalog } = {}) {
    this.triggerRepository = triggerRepository
    this.createTriggersQuery = createTriggersQuery
    this.createTrigger = createTrigger
    this.updateTrigger = updateTrigger
    this.importFacebookCatalog = importFacebookCatalog

    this.create = this.create.bind(this)
    this.update = this.update.bind(this)
    this.show = this.show.bind(this)
    this.index = this.index.bind(this)
    this.importation = this.importation.bind(this)
  }

  async create(req, res) {
    try {
      const trigger = await this.createTrigger.execute(req.body)

      return res.status(201).send(trigger)
    } catch (err) {
      if ('errors' in err) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }

      return res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async update(req, res) {
    try {
      const trigger = await this.updateTrigger.execute(req.params.id, req.body)

      return res.status(200).send(trigger)
    } catch (err) {
      if ('errors' in err) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }

      return res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async show(req, res) {
    try {
      const trigger = await this.triggerRepository.findFirst({ _id: req.params.id }, ['licensee'])

      res.status(200).send(trigger)
    } catch (err) {
      if (err.toString().includes('Cast to ObjectId failed for value')) {
        return res.status(404).send({ errors: { message: `Trigger ${req.params.id} não encontrada` } })
      } else {
        return res.status(500).send({ errors: { message: err.toString() } })
      }
    }
  }

  async index(req, res) {
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
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async importation(req, res) {
    try {
      await this.importFacebookCatalog.execute(req.params.id, req.body.text)

      return res.status(201).send({ body: 'OK' })
    } catch (err) {
      return res.status(500).send({ errors: { message: err.toString() } })
    }
  }
}

export { TriggersController }
