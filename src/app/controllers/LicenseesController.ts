import { check, validationResult } from 'express-validator'
import { sanitizeExpressErrors, sanitizeModelErrors } from '../helpers/SanitizeErrors'
import { GetBaileysQr } from '../usecases/licensees/GetBaileysQr'
import { GetBaileysStatus } from '../usecases/licensees/GetBaileysStatus'
import { SyncBaileysDirectory } from '../usecases/licensees/SyncBaileysDirectory'

class LicenseesController {
  licenseeRepository: any
  createLicenseesQuery: any
  createLicensee: any
  updateLicensee: any
  setDialogWebhookUseCase: any
  getBaileysQrUseCase: any
  getBaileysStatusUseCase: any
  syncBaileysDirectoryUseCase: any

  constructor({
    licenseeRepository,
    createLicenseesQuery,
    createLicensee,
    updateLicensee,
    setDialogWebhook,
    createMessengerPlugin,
    whatsappSessionRepository,
    contactRepository,
  }: Record<string, any> = {}) {
    this.licenseeRepository = licenseeRepository
    this.createLicenseesQuery = createLicenseesQuery
    this.createLicensee = createLicensee
    this.updateLicensee = updateLicensee
    this.setDialogWebhookUseCase = setDialogWebhook
    this.getBaileysQrUseCase = new GetBaileysQr({ licenseeRepository, createMessengerPlugin })
    this.getBaileysStatusUseCase = new GetBaileysStatus({ licenseeRepository, whatsappSessionRepository })
    this.syncBaileysDirectoryUseCase = new SyncBaileysDirectory({
      licenseeRepository,
      contactRepository,
      createMessengerPlugin,
    })

    this.create = this.create.bind(this)
    this.update = this.update.bind(this)
    this.show = this.show.bind(this)
    this.index = this.index.bind(this)
    this.setDialogWebhook = this.setDialogWebhook.bind(this)
    this.getBaileysQr = this.getBaileysQr.bind(this)
    this.getBaileysStatus = this.getBaileysStatus.bind(this)
    this.baileysSync = this.baileysSync.bind(this)
  }

  validations() {
    return [
      check('email', 'Email deve ser preenchido com um valor válido')
        .optional({ checkFalsy: true })
        .isEmail()
        .normalizeEmail(),
    ]
  }

  async create(req: any, res: any) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: sanitizeExpressErrors(errors.array()) })
    }

    try {
      const licensee = await this.createLicensee.execute(req.body)

      return res.status(201).send(licensee)
    } catch (err: any) {
      if (err?.errors) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }

      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async update(req: any, res: any) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: sanitizeExpressErrors(errors.array()) })
    }

    try {
      const licensee = await this.updateLicensee.execute(req.params.id, req.body)

      return res.status(200).send(licensee)
    } catch (err: any) {
      if (err?.errors) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }

      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async show(req: any, res: any) {
    try {
      const licensee = await this.licenseeRepository.findFirst({ _id: req.params.id })

      res.status(200).send(licensee)
    } catch (err: any) {
      if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(404).send({ errors: { message: 'Licenciado 12312 não encontrado' } })
      } else {
        return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
      }
    }
  }

  async index(req: any, res: any) {
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

      const licensees = await licenseesQuery.all()

      res.status(200).send(licensees)
    } catch (err: any) {
      res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async setDialogWebhook(req: any, res: any) {
    try {
      const response = await this.setDialogWebhookUseCase.execute(req.params.id)

      return res.status(200).send(response)
    } catch (err: any) {
      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async getBaileysQr(req: any, res: any) {
    try {
      const response = await this.getBaileysQrUseCase.execute(req.params.id)

      return res.status(200).send(response)
    } catch (err: any) {
      return res.status(408).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async getBaileysStatus(req: any, res: any) {
    try {
      const response = await this.getBaileysStatusUseCase.execute(req.params.id)

      return res.status(200).send(response)
    } catch (err: any) {
      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async baileysSync(req: any, res: any) {
    try {
      const response = await this.syncBaileysDirectoryUseCase.execute(req.params.id)

      return res.status(200).send(response)
    } catch (err: any) {
      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }
}

export { LicenseesController }
