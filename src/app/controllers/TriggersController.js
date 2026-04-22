import { TriggerRepositoryDatabase } from '../repositories/trigger.js'
import { sanitizeModelErrors } from '../helpers/SanitizeErrors.js'
import _ from 'lodash'
import { TriggersQuery } from '../queries/TriggersQuery.js'
import { FacebookCatalogImporter } from '../plugins/importers/facebook_catalog/index.js'

function permit(fields) {
  const permitedFields = [
    'name',
    'triggerKind',
    'expression',
    'catalogMulti',
    'catalogSingle',
    'textReplyButton',
    'messagesList',
    'licensee',
    'order',
    'text',
    'catalogId',
  ]

  return _.pick(fields, permitedFields)
}

class TriggersController {
  constructor({
    triggerRepository = new TriggerRepositoryDatabase(),
    createTriggersQuery,
    createFacebookCatalogImporter,
  } = {}) {
    this.triggerRepository = triggerRepository
    this.createTriggersQuery =
      createTriggersQuery ?? (() => new TriggersQuery({ triggerRepository: this.triggerRepository }))
    this.createFacebookCatalogImporter = createFacebookCatalogImporter ?? ((id) => new FacebookCatalogImporter(id))

    this.create = this.create.bind(this)
    this.update = this.update.bind(this)
    this.show = this.show.bind(this)
    this.index = this.index.bind(this)
    this.importation = this.importation.bind(this)
  }

  async create(req, res) {
    const {
      name,
      triggerKind,
      expression,
      catalogMulti,
      catalogSingle,
      textReplyButton,
      messagesList,
      licensee,
      order,
      text,
      catalogId,
    } = req.body

    try {
      const trigger = await this.triggerRepository.create({
        name,
        triggerKind,
        expression,
        catalogMulti,
        catalogSingle,
        textReplyButton,
        messagesList,
        licensee,
        order,
        text,
        catalogId,
      })

      res.status(201).send(trigger)
    } catch (err) {
      if ('errors' in err) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async update(req, res) {
    const fields = permit(req.body)
    delete fields.licensee

    try {
      await this.triggerRepository.update(req.params.id, { ...fields })
    } catch (err) {
      return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
    }

    try {
      const trigger = await this.triggerRepository.findFirst({ _id: req.params.id })

      res.status(200).send(trigger)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
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
    const data = req.body.text
    try {
      const facebookCatalogImporter = this.createFacebookCatalogImporter(req.params.id)
      await facebookCatalogImporter.importCatalog(data)

      res.status(201).send({ body: 'OK' })
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }
}

export { TriggersController }
