import Trigger from '@models/Trigger'
import { sanitizeModelErrors } from '@helpers/SanitizeErrors'
import _ from 'lodash'
import TriggersQuery from '@queries/TriggersQuery'
import FacebookCatalogImporter from '@plugins/importers/facebook_catalog/index'

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

    const trigger = new Trigger({
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

    const validation = trigger.validateSync()

    try {
      if (validation) {
        return res.status(422).json({ errors: sanitizeModelErrors(validation.errors) })
      } else {
        await trigger.save()
      }

      res.status(201).send(trigger)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async update(req, res) {
    const fields = permit(req.body)
    delete fields.licensee

    try {
      await Trigger.updateOne({ _id: req.params.id }, { $set: fields }, { runValidators: true })
    } catch (err) {
      return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
    }

    try {
      const trigger = await Trigger.findOne({ _id: req.params.id })

      res.status(200).send(trigger)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async show(req, res) {
    try {
      const trigger = await Trigger.findOne({ _id: req.params.id }).populate('licensee')

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

      const triggersQuery = new TriggersQuery()

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
      const facebookCatalogImporter = new FacebookCatalogImporter(req.params.id)
      await facebookCatalogImporter.importCatalog(data)

      res.status(201).send({ body: 'OK' })
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }
}

export default TriggersController
