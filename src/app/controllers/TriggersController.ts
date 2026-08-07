import { Request, Response } from 'express'
import { sanitizeModelErrors } from '../helpers/SanitizeErrors'
import { IRepository } from '@repositories/repository'
import { ITrigger } from '../../types'
import { CreateTrigger } from '../usecases/triggers/CreateTrigger'
import { UpdateTrigger } from '../usecases/triggers/UpdateTrigger'
import { TriggersQuery } from '../queries/TriggersQuery'

class TriggersController {
  triggerRepository: IRepository<ITrigger>
  createTriggersQuery: () => TriggersQuery
  createTrigger: CreateTrigger
  updateTrigger: UpdateTrigger

  constructor({
    triggerRepository,
    createTriggersQuery,
    createTrigger,
    updateTrigger,
  }: {
    triggerRepository?: IRepository<ITrigger>
    createTriggersQuery?: () => TriggersQuery
    createTrigger?: CreateTrigger
    updateTrigger?: UpdateTrigger
  } = {}) {
    this.triggerRepository = triggerRepository!
    this.createTriggersQuery = createTriggersQuery!
    this.createTrigger = createTrigger!
    this.updateTrigger = updateTrigger!

    this.create = this.create.bind(this)
    this.update = this.update.bind(this)
    this.show = this.show.bind(this)
    this.index = this.index.bind(this)
  }

  async create(req: Request, res: Response) {
    try {
      const trigger = await this.createTrigger.execute(req.body)

      return res.status(201).send(trigger)
    } catch (err: any) {
      if ('errors' in err) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }

      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const trigger = await this.updateTrigger.execute(req.params.id as string, req.body)

      return res.status(200).send(trigger)
    } catch (err: any) {
      if ('errors' in err) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }

      return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async show(req: Request, res: Response) {
    try {
      const trigger = await this.triggerRepository.findFirst({ _id: req.params.id as string }, ['licensee'])

      res.status(200).send(trigger)
    } catch (err: any) {
      if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(404).send({ errors: { message: `Trigger ${req.params.id as string} não encontrada` } })
      } else {
        return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
      }
    }
  }

  async index(req: Request, res: Response) {
    try {
      const page = req.query.page || 1
      const limit = req.query.limit || 30

      const triggersQuery = this.createTriggersQuery()

      triggersQuery.page(page as number)
      triggersQuery.limit(limit as number)

      if (req.query.kind) {
        triggersQuery.filterByKind(req.query.type as string)
      }

      if (req.query.licensee) {
        triggersQuery.filterByLicensee(req.query.licensee as string)
      }

      if (req.query.expression) {
        triggersQuery.filterByExpression(req.query.expression as string)
      }

      const triggers = await triggersQuery.all()

      res.status(200).send(triggers)
    } catch (err: any) {
      res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }
}

export { TriggersController }
