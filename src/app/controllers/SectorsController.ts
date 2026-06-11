import { sanitizeModelErrors } from '../helpers/SanitizeErrors'
import { GetBaileysQrForSector } from '../usecases/licensees/GetBaileysQrForSector'
import { GetBaileysStatusForSector } from '../usecases/licensees/GetBaileysStatusForSector'
import { SyncBaileysDirectoryForSector } from '../usecases/licensees/SyncBaileysDirectoryForSector'

class SectorsController {
  sectorRepository: any
  getBaileysQrUseCase: any
  getBaileysStatusUseCase: any
  syncBaileysDirectoryUseCase: any

  constructor({
    sectorRepository,
    licenseeRepository,
    whatsappSessionRepository,
    contactRepository,
    createMessengerPlugin,
    startBaileysSocket,
    socketManager,
  }: Record<string, any> = {}) {
    this.sectorRepository = sectorRepository
    this.getBaileysQrUseCase = new GetBaileysQrForSector({
      sectorRepository,
      licenseeRepository,
      createMessengerPlugin,
      startBaileysSocket,
    })
    this.getBaileysStatusUseCase = new GetBaileysStatusForSector({
      sectorRepository,
      licenseeRepository,
      whatsappSessionRepository,
      startBaileysSocket,
      socketManager,
    })
    this.syncBaileysDirectoryUseCase = new SyncBaileysDirectoryForSector({
      sectorRepository,
      licenseeRepository,
      contactRepository,
      createMessengerPlugin,
    })

    this.index = this.index.bind(this)
    this.show = this.show.bind(this)
    this.create = this.create.bind(this)
    this.update = this.update.bind(this)
    this.destroy = this.destroy.bind(this)
    this.getBaileysQr = this.getBaileysQr.bind(this)
    this.getBaileysStatus = this.getBaileysStatus.bind(this)
    this.baileysSync = this.baileysSync.bind(this)
  }

  async index(req: any, res: any) {
    try {
      const params: any = {}
      if (req.query.licensee) params.licensee = req.query.licensee

      const sectors = await this.sectorRepository.find(params, ['licensee', 'users'])
      return res.status(200).send(sectors)
    } catch (err: any) {
      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async show(req: any, res: any) {
    try {
      const sector = await this.sectorRepository.findFirst({ _id: req.params.id }, ['licensee', 'users'])
      return res.status(200).send(sector)
    } catch (err: any) {
      if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(404).send({ errors: { message: `Setor ${req.params.id} não encontrado` } })
      }
      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async create(req: any, res: any) {
    try {
      const sector = await this.sectorRepository.create(req.body)
      return res.status(201).send(sector)
    } catch (err: any) {
      if (err?.errors) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }
      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async update(req: any, res: any) {
    try {
      await this.sectorRepository.update(req.params.id, req.body)
      const sector = await this.sectorRepository.findFirst({ _id: req.params.id })
      return res.status(200).send(sector)
    } catch (err: any) {
      if (err?.errors) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }
      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async destroy(req: any, res: any) {
    try {
      await this.sectorRepository.delete({ _id: req.params.id })
      return res.status(204).send()
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

export { SectorsController }
