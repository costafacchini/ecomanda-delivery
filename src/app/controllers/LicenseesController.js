import { check, validationResult } from 'express-validator'
import { sanitizeExpressErrors, sanitizeModelErrors } from '../helpers/SanitizeErrors.js'
import { GetBaileysQr } from '../usecases/licensees/GetBaileysQr.js'

class LicenseesController {
  constructor({
    licenseeRepository,
    createLicenseesQuery,
    createLicensee,
    updateLicensee,
    setDialogWebhook,
    sendLicenseeToPagarMe,
    signPedidos10OrderWebhook,
    createMessengerPlugin,
  } = {}) {
    this.licenseeRepository = licenseeRepository
    this.createLicenseesQuery = createLicenseesQuery
    this.createLicensee = createLicensee
    this.updateLicensee = updateLicensee
    this.setDialogWebhookUseCase = setDialogWebhook
    this.sendLicenseeToPagarMe = sendLicenseeToPagarMe
    this.signPedidos10OrderWebhook = signPedidos10OrderWebhook
    this.getBaileysQrUseCase = new GetBaileysQr({ licenseeRepository, createMessengerPlugin })

    this.create = this.create.bind(this)
    this.update = this.update.bind(this)
    this.show = this.show.bind(this)
    this.index = this.index.bind(this)
    this.setDialogWebhook = this.setDialogWebhook.bind(this)
    this.sendToPagarMe = this.sendToPagarMe.bind(this)
    this.signOrderWebhook = this.signOrderWebhook.bind(this)
    this.getBaileysQr = this.getBaileysQr.bind(this)
  }

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

    try {
      const licensee = await this.createLicensee.execute(req.body)

      return res.status(201).send(licensee)
    } catch (err) {
      if (err?.errors) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }

      return res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async update(req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: sanitizeExpressErrors(errors.array()) })
    }

    try {
      const licensee = await this.updateLicensee.execute(req.params.id, req.body)

      return res.status(200).send(licensee)
    } catch (err) {
      if (err?.errors) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }

      return res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async show(req, res) {
    try {
      const licensee = await this.licenseeRepository.findFirst({ _id: req.params.id })
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

      const licenseesQuery = this.createLicenseesQuery()

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

      const licensees = await licenseesQuery.all()

      res.status(200).send(licensees)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async setDialogWebhook(req, res) {
    try {
      const response = await this.setDialogWebhookUseCase.execute(req.params.id)

      return res.status(200).send(response)
    } catch (err) {
      return res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async sendToPagarMe(req, res) {
    try {
      const response = await this.sendLicenseeToPagarMe.execute(req.params.id)

      return res.status(200).send(response)
    } catch (err) {
      return res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async signOrderWebhook(req, res) {
    try {
      const response = await this.signPedidos10OrderWebhook.execute(req.params.id)

      return res.status(200).send(response)
    } catch (err) {
      return res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async getBaileysQr(req, res) {
    try {
      const response = await this.getBaileysQrUseCase.execute(req.params.id)

      return res.status(200).send(response)
    } catch (error) {
      return res.status(408).send({ message: error.message })
    }
  }
}

export { LicenseesController }
