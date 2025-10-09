const { LicenseeRepositoryDatabase } = require('@repositories/licensee')
const createMessengerPlugin = require('@plugins/messengers/factory')
const { check, validationResult } = require('express-validator')
const { sanitizeExpressErrors, sanitizeModelErrors } = require('../helpers/SanitizeErrors')
const _ = require('lodash')
const LicenseesQuery = require('@queries/LicenseesQuery')
const PagarMe = require('@plugins/payments/PagarMe')
const Pedidos10 = require('@plugins/integrations/Pedidos10')

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
    'cartDefault',
    'unidadeId',
    'statusId',
    'messageOnCloseChat',
    'useCartGallabox',
    'productFractional2Name',
    'productFractional2Id',
    'productFractional3Name',
    'productFractional3Id',
    'productFractionalSize3Name',
    'productFractionalSize3Id',
    'productFractionalSize4Name',
    'productFractionalSize4Id',
    'productFractionals',
    'pedidos10_active',
    'pedidos10_integration',
    'pedidos10_integrator',
    'document',
    'kind',
    'financial_player_fee',
    'holder_name',
    'bank',
    'branch_number',
    'branch_check_digit',
    'account_number',
    'account_check_digit',
    'holder_kind',
    'holder_document',
    'account_type',
    'useSenderName',
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
      cartDefault,
      unidadeId,
      statusId,
      messageOnCloseChat,
      useCartGallabox,
      productFractional2Name,
      productFractional2Id,
      productFractional3Name,
      productFractional3Id,
      productFractionalSize3Name,
      productFractionalSize3Id,
      productFractionalSize4Name,
      productFractionalSize4Id,
      productFractionals,
      pedidos10_active,
      pedidos10_integration,
      pedidos10_integrator,
      document,
      kind,
      financial_player_fee,
      holder_name,
      bank,
      branch_number,
      branch_check_digit,
      account_number,
      account_check_digit,
      holder_kind,
      holder_document,
      account_type,
      useSenderName,
    } = req.body

    try {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create({
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
        cartDefault,
        unidadeId,
        statusId,
        messageOnCloseChat,
        useCartGallabox,
        productFractional2Name,
        productFractional2Id,
        productFractional3Name,
        productFractional3Id,
        productFractionalSize3Name,
        productFractionalSize3Id,
        productFractionalSize4Name,
        productFractionalSize4Id,
        productFractionals,
        pedidos10_active,
        pedidos10_integration: JSON.parse(pedidos10_integration || '{}'),
        pedidos10_integrator,
        document,
        kind,
        financial_player_fee,
        holder_name,
        bank,
        branch_number,
        branch_check_digit,
        account_number,
        account_check_digit,
        holder_kind,
        holder_document,
        account_type,
        useSenderName,
      })

      res.status(201).send(licensee)
    } catch (err) {
      if ('errors' in err) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async update(req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: sanitizeExpressErrors(errors.array()) })
    }

    const fields = permit(req.body)

    const licenseeRepository = new LicenseeRepositoryDatabase()
    try {
      fields.pedidos10_integration = JSON.parse(fields.pedidos10_integration || '{}')
      await licenseeRepository.update(req.params.id, { ...fields })
    } catch (err) {
      return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
    }

    try {
      const licensee = await licenseeRepository.findFirst({ _id: req.params.id })
      licensee.pedidos10_integration = JSON.stringify(licensee.pedidos10_integration)

      res.status(200).send(licensee)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async show(req, res) {
    try {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.findFirst({ _id: req.params.id })
      licensee.pedidos10_integration = JSON.stringify(licensee.pedidos10_integration)

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
      const page = req.query.page || 1
      const limit = req.query.limit || 30

      const licenseesQuery = new LicenseesQuery()

      licenseesQuery.page(page)
      licenseesQuery.limit(limit)

      if (req.query.chatDefault) {
        licenseesQuery.filterByChatDefault(req.query.chatDefault)
      }

      if (req.query.chatbotDefault) {
        licenseesQuery.filterByChatbotDefault(req.query.chatbotDefault)
      }

      if (req.query.whatsappDefault) {
        licenseesQuery.filterByWhatsappDefault(req.query.whatsappDefault)
      }

      if (req.query.expression) {
        licenseesQuery.filterByExpression(req.query.expression)
      }

      if (req.query.active) {
        licenseesQuery.filterByActive()
      }

      if (req.query.pedidos10_active) {
        licenseesQuery.filterByPedidos10Active(req.query.pedidos10_active)
      }

      const messages = await licenseesQuery.all()

      res.status(200).send(messages)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async setDialogWebhook(req, res) {
    try {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.findFirst({ _id: req.params.id })

      if (licensee.whatsappDefault === 'dialog') {
        const pluginWhatsapp = createMessengerPlugin(licensee)
        await pluginWhatsapp.setWebhook(licensee.whatsappUrl, licensee.whatsappToken)
      }

      res.status(200).send({ message: 'Webhook configurado!' })
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async sendToPagarMe(req, res) {
    try {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.findFirst({ _id: req.params.id })
      const pagarMe = new PagarMe()

      if (licensee.recipient_id) {
        pagarMe.recipient.update(licensee, process.env.PAGARME_TOKEN)
      } else {
        pagarMe.recipient.create(licensee, process.env.PAGARME_TOKEN)
      }

      res.status(200).send({ message: 'Licenciado enviado para a pagar.me!' })
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async signOrderWebhook(req, res) {
    try {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.findFirst({ _id: req.params.id })

      if (!licensee.pedidos10_integration) {
        return res.status(200).send({ message: 'Webhook não assinado pois não tem os dados para o login!' })
      }

      const pedidos10 = new Pedidos10(licensee)
      await pedidos10.signOrderWebhook()

      res.status(200).send({ message: 'Webhook assinado!' })
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }
}

module.exports = LicenseesController
