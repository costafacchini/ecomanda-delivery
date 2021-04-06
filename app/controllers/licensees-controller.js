const Licensee = require('@models/licensee')
const { check, validationResult } = require('express-validator')
const { sanitizeExpressErrors, sanitizeModelErrors } = require('../helpers/sanitize-errors')
const _ = require('lodash')

function permit (fields) {
  const permitedFields = [
    'name',
    'email',
    'phone',
    'active',
    'licenseKind',
    'useChatbot',
    'chatbotDefault',
    'chatbotUrl',
    'chatbotAuthorizationToken',
    'whatsappDefault',
    'whatsappToken',
    'whatsappUrl',
    'chatDefault',
    'chatUrl',
    'awsId',
    'awsSecret',
    'bucketName',
  ]

  return _.pick(fields, permitedFields)
}

class LicenseesController {
  validations () {
    return [
      check('email', 'Email deve ser preenchido com um valor válido').
        optional().
        isEmail()
    ]
  }

  async create (req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).
        json({errors: sanitizeExpressErrors(errors.array())})
    }

    const {
      name,
      email,
      phone,
      active,
      licenseKind,
      useChatbot,
      chatbotDefault,
      chatbotUrl,
      chatbotAuthorizationToken,
      whatsappDefault,
      whatsappToken,
      whatsappUrl,
      chatDefault,
      chatUrl,
      awsId,
      awsSecret,
      bucketName,
    } = req.body

    const licensee = new Licensee({
      name,
      email,
      phone,
      active,
      licenseKind,
      useChatbot,
      chatbotDefault,
      chatbotUrl,
      chatbotAuthorizationToken,
      whatsappDefault,
      whatsappToken,
      whatsappUrl,
      chatDefault,
      chatUrl,
      awsId,
      awsSecret,
      bucketName,
    })

    const validation = licensee.validateSync()

    try {
      if (validation) {
        return res.status(422).
          json({errors: sanitizeModelErrors(validation.errors)})
      } else {
        await licensee.save()
      }

      res.status(201).
        send(licensee)
    } catch (err) {
      res.status(500).
        send({errors: {message: err.toString()}})
    }
  }

  async update (req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).
        json({errors: sanitizeExpressErrors(errors.array())})
    }

    const fields = permit(req.body)

    try {
      await Licensee.updateOne({_id: req.params.id}, {$set: fields}, {runValidators: true})
    } catch (err) {
      return res.status(422).
        json({errors: sanitizeModelErrors(err.errors)})
    }

    try {
      const licensee = await Licensee.findOne({_id: req.params.id})

      res.status(200).
        send(licensee)
    } catch (err) {
      res.status(500).
        send({errors: {message: err.toString()}})
    }
  }

  async show (req, res) {
    try {
      const licensee = await Licensee.findOne({_id: req.params.id})

      res.status(200).
        send(licensee)
    } catch (err) {
      if (err.toString().
        includes('Cast to ObjectId failed for value')) {
        return res.status(404).
          send({errors: {message: 'Licenciado 12312 não encontrado'}})
      } else {
        return res.status(500).
          send({errors: {message: err.toString()}})
      }
    }
  }

  async index (req, res) {
    try {
      res.status(200).
        send(await Licensee.find({}))
    } catch (err) {
      res.status(500).
        send({errors: {message: err.toString()}})
    }
  }
}

module.exports = LicenseesController
