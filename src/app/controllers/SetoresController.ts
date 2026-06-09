import { sanitizeModelErrors } from '../helpers/SanitizeErrors'

class SetoresController {
  setorRepository: any

  constructor({ setorRepository }: Record<string, any> = {}) {
    this.setorRepository = setorRepository

    this.index = this.index.bind(this)
    this.show = this.show.bind(this)
    this.create = this.create.bind(this)
    this.update = this.update.bind(this)
    this.destroy = this.destroy.bind(this)
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
}

export { SetoresController }
