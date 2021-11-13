const Licensee = require('@models/Licensee')
const createMessengerPlugin = require('../plugins/messengers/factory')
const { check, validationResult } = require('express-validator')
const { sanitizeExpressErrors, sanitizeModelErrors } = require('../helpers/SanitizeErrors')
const _ = require('lodash')
const LicenseesQuery = require('@queries/LicenseesQuery')

function permit(fields) {
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
    'chatbotApiToken',
    'messageOnResetChatbot',
    'whatsappDefault',
    'whatsappToken',
    'whatsappUrl',
    'chatDefault',
    'chatUrl',
    'awsId',
    'awsSecret',
    'bucketName',
    'chatIdentifier',
    'chatKey',
  ]

  return _.pick(fields, permitedFields)
}

class LicenseesController {
  validations() {
    return [
      check('email', 'Email deve ser preenchido com um valor válido')
        .optional({ checkFalsy: true })
        .isEmail()
        .normalizeEmail(),
    ]
  }

  async create(req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: sanitizeExpressErrors(errors.array()) })
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
      messageOnResetChatbot,
      chatbotApiToken,
      whatsappDefault,
      whatsappToken,
      whatsappUrl,
      chatDefault,
      chatUrl,
      awsId,
      awsSecret,
      bucketName,
      chatIdentifier,
      chatKey,
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
      messageOnResetChatbot,
      chatbotApiToken,
      whatsappDefault,
      whatsappToken,
      whatsappUrl,
      chatDefault,
      chatUrl,
      awsId,
      awsSecret,
      bucketName,
      chatIdentifier,
      chatKey,
    })

    const validation = licensee.validateSync()

    try {
      if (validation) {
        return res.status(422).json({ errors: sanitizeModelErrors(validation.errors) })
      } else {
        await licensee.save()
      }

      res.status(201).send(licensee)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async update(req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: sanitizeExpressErrors(errors.array()) })
    }

    const fields = permit(req.body)

    try {
      await Licensee.updateOne({ _id: req.params.id }, { $set: fields }, { runValidators: true })
    } catch (err) {
      return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
    }

    try {
      const licensee = await Licensee.findOne({ _id: req.params.id })

      res.status(200).send(licensee)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async show(req, res) {
    try {
      const licensee = await Licensee.findOne({ _id: req.params.id })

      res.status(200).send(licensee)
    } catch (err) {
      if (err.toString().includes('Cast to ObjectId failed for value')) {
        return res.status(404).send({ errors: { message: 'Licenciado 12312 não encontrado' } })
      } else {
        return res.status(500).send({ errors: { message: err.toString() } })
      }
    }
  }

  async index(req, res) {
    try {
      const page = req.body.page || 1
      const limit = req.body.limit || 30

      const licenseesQuery = new LicenseesQuery()

      licenseesQuery.page(page)
      licenseesQuery.limit(limit)

      if (req.body.chatDefault) {
        licenseesQuery.filterByChatDefault(req.body.chatDefault)
      }

      if (req.body.chatbotDefault) {
        licenseesQuery.filterByChatbotDefault(req.body.chatbotDefault)
      }

      if (req.body.whatsappDefault) {
        licenseesQuery.filterByWhatsappDefault(req.body.whatsappDefault)
      }

      if (req.body.expression) {
        licenseesQuery.filterByExpression(req.body.expression)
      }

      const messages = await licenseesQuery.all()

      res.status(200).send(messages)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async setDialogWebhook(req, res) {
    try {
      const licensee = await Licensee.findOne({ _id: req.params.id })

      if (licensee.whatsappDefault === 'dialog') {
        const pluginWhatsapp = createMessengerPlugin(licensee)
        await pluginWhatsapp.setWebhook(licensee.whatsappUrl, licensee.whatsappToken)
      }

      res.status(200).send({ message: 'Webhook configurado!' })
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }
}

module.exports = LicenseesController
