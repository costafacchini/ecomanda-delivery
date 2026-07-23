import { sanitizeModelErrors } from '../helpers/SanitizeErrors'
import { GetBaileysQrForInbox } from '../usecases/licensees/GetBaileysQrForInbox'
import { GetBaileysStatusForInbox } from '../usecases/licensees/GetBaileysStatusForInbox'
import { SyncBaileysDirectoryForInbox } from '../usecases/licensees/SyncBaileysDirectoryForInbox'

class InboxesController {
  inboxRepository: any
  getBaileysQrUseCase: any
  getBaileysStatusUseCase: any
  syncBaileysDirectoryUseCase: any

  constructor({
    inboxRepository,
    licenseeRepository,
    whatsappSessionRepository,
    contactRepository,
    createMessengerPlugin,
    startBaileysSocket,
    socketManager,
  }: Record<string, any> = {}) {
    this.inboxRepository = inboxRepository
    this.getBaileysQrUseCase = new GetBaileysQrForInbox({
      inboxRepository,
      licenseeRepository,
      createMessengerPlugin,
      startBaileysSocket,
    })
    this.getBaileysStatusUseCase = new GetBaileysStatusForInbox({
      inboxRepository,
      licenseeRepository,
      whatsappSessionRepository,
      startBaileysSocket,
      socketManager,
    })
    this.syncBaileysDirectoryUseCase = new SyncBaileysDirectoryForInbox({
      inboxRepository,
      licenseeRepository,
      contactRepository,
      createMessengerPlugin,
    })

    this.index = this.index.bind(this)
    this.show = this.show.bind(this)
    this.create = this.create.bind(this)
    this.update = this.update.bind(this)
    this.destroy = this.destroy.bind(this)
    this.baileysQr = this.baileysQr.bind(this)
    this.baileysStatus = this.baileysStatus.bind(this)
    this.baileysSync = this.baileysSync.bind(this)
  }

  async index(req: any, res: any) {
    try {
      const params: any = {}
      if (req.query.licensee) params.licensee = req.query.licensee

      const inboxes = await this.inboxRepository.find(params, ['licensee'])
      return res.status(200).send(inboxes)
    } catch (err: any) {
      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async show(req: any, res: any) {
    try {
      const inbox = await this.inboxRepository.findFirst({ _id: req.params.id })
      if (!inbox) return res.status(404).send({ errors: { message: 'Inbox não encontrada' } })
      return res.status(200).send(inbox)
    } catch (err: any) {
      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async create(req: any, res: any) {
    try {
      const inbox = await this.inboxRepository.create(req.body)
      return res.status(201).send(inbox)
    } catch (err: any) {
      if (err?.errors) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }
      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async update(req: any, res: any) {
    try {
      await this.inboxRepository.update(req.params.id, req.body)
      const inbox = await this.inboxRepository.findFirst({ _id: req.params.id })
      return res.status(200).send(inbox)
    } catch (err: any) {
      if (err?.errors) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }
      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async destroy(req: any, res: any) {
    try {
      await this.inboxRepository.delete({ _id: req.params.id })
      return res.status(204).send()
    } catch (err: any) {
      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async baileysQr(req: any, res: any) {
    try {
      const response = await this.getBaileysQrUseCase.execute(req.params.id)

      return res.status(200).send(response)
    } catch (err: any) {
      return res.status(408).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async baileysStatus(req: any, res: any) {
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

export { InboxesController }
