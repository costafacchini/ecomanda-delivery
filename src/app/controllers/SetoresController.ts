import { sanitizeModelErrors } from '../helpers/SanitizeErrors'
import { GetBaileysQrForSetor } from '../usecases/licensees/GetBaileysQrForSetor'
import { GetBaileysStatusForSetor } from '../usecases/licensees/GetBaileysStatusForSetor'
import { SyncBaileysDirectoryForSetor } from '../usecases/licensees/SyncBaileysDirectoryForSetor'

class SetoresController {
  setorRepository: any
  getBaileysQrUseCase: any
  getBaileysStatusUseCase: any
  syncBaileysDirectoryUseCase: any

  constructor({
    setorRepository,
    licenseeRepository,
    whatsappSessionRepository,
    contactRepository,
    createMessengerPlugin,
    startBaileysSocket,
    socketManager,
  }: Record<string, any> = {}) {
    this.setorRepository = setorRepository
    this.getBaileysQrUseCase = new GetBaileysQrForSetor({
      setorRepository,
      licenseeRepository,
      createMessengerPlugin,
      startBaileysSocket,
    })
    this.getBaileysStatusUseCase = new GetBaileysStatusForSetor({
      setorRepository,
      licenseeRepository,
      whatsappSessionRepository,
      startBaileysSocket,
      socketManager,
    })
    this.syncBaileysDirectoryUseCase = new SyncBaileysDirectoryForSetor({
      setorRepository,
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

      const setores = await this.setorRepository.find(params, ['users'])
      return res.status(200).send(setores)
    } catch (err: any) {
      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async show(req: any, res: any) {
    try {
      const setor = await this.setorRepository.findFirst({ _id: req.params.id }, ['users'])
      return res.status(200).send(setor)
    } catch (err: any) {
      if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(404).send({ errors: { message: `Setor ${req.params.id} não encontrado` } })
      }
      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async create(req: any, res: any) {
    try {
      const setor = await this.setorRepository.create(req.body)
      return res.status(201).send(setor)
    } catch (err: any) {
      if (err?.errors) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }
      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async update(req: any, res: any) {
    try {
      await this.setorRepository.update(req.params.id, req.body)
      const setor = await this.setorRepository.findFirst({ _id: req.params.id })
      return res.status(200).send(setor)
    } catch (err: any) {
      if (err?.errors) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }
      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async destroy(req: any, res: any) {
    try {
      await this.setorRepository.delete({ _id: req.params.id })
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

export { SetoresController }
