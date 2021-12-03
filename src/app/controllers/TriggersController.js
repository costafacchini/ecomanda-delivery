const Trigger = require('@models/Trigger')
const { validationResult } = require('express-validator')
const { sanitizeExpressErrors, sanitizeModelErrors } = require('../helpers/SanitizeErrors')
const _ = require('lodash')
const TriggersQuery = require('@queries/TriggersQuery')

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
  ]

  return _.pick(fields, permitedFields)
}

class TriggersController {
  async create(req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: sanitizeExpressErrors(errors.array()) })
    }

    const { name, triggerKind, expression, catalogMulti, catalogSingle, textReplyButton, messagesList, licensee } =
      req.body

    const trigger = new Trigger({
      name,
      triggerKind,
      expression,
      catalogMulti,
      catalogSingle,
      textReplyButton,
      messagesList,
      licensee,
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
        triggersQuery.filterByType(req.query.type)
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
}

module.exports = TriggersController
