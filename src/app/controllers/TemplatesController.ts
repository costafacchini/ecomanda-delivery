import { Request, Response } from 'express'
import { sanitizeModelErrors } from '../helpers/SanitizeErrors'
import _ from 'lodash'
import { IRepository } from '@repositories/repository'
import { ITemplate } from '../../types'
import { TemplatesQuery } from '../queries/TemplatesQuery'

interface TemplatesImporter {
  import(): Promise<void>
}

function permit(fields: Record<string, unknown>) {
  const permitedFields = ['name', 'namespace', 'licensee']

  return _.pick(fields, permitedFields)
}

class TemplatesController {
  templateRepository: IRepository<ITemplate>
  createTemplatesQuery: () => TemplatesQuery
  createTemplatesImporter: (id: string) => TemplatesImporter

  constructor({
    templateRepository,
    createTemplatesQuery,
    createTemplatesImporter,
  }: {
    templateRepository?: IRepository<ITemplate>
    createTemplatesQuery?: () => TemplatesQuery
    createTemplatesImporter?: (id: string) => TemplatesImporter
  } = {}) {
    this.templateRepository = templateRepository!
    this.createTemplatesQuery = createTemplatesQuery!
    this.createTemplatesImporter = createTemplatesImporter!

    this.create = this.create.bind(this)
    this.update = this.update.bind(this)
    this.show = this.show.bind(this)
    this.index = this.index.bind(this)
    this.importation = this.importation.bind(this)
  }

  async create(req: Request, res: Response) {
    const { name, namespace, licensee } = req.body

    try {
      const template = await this.templateRepository.create({ name, namespace, licensee })

      res.status(201).send(template)
    } catch (err: any) {
      if ('errors' in err) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }
      res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async update(req: Request, res: Response) {
    const fields = permit(req.body)
    delete fields.licensee

    try {
      await this.templateRepository.update(req.params.id as string, { ...fields })
    } catch (err: any) {
      return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
    }

    try {
      const template = await this.templateRepository.findFirst({ _id: req.params.id as string })

      res.status(200).send(template)
    } catch (err: any) {
      res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async show(req: Request, res: Response) {
    try {
      const template = await this.templateRepository.findFirst({ _id: req.params.id as string }, ['licensee'])

      res.status(200).send(template)
    } catch (err: any) {
      if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(404).send({ errors: { message: `Template ${req.params.id as string} não encontrado` } })
      } else {
        return res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
      }
    }
  }

  async index(req: Request, res: Response) {
    try {
      const page = req.query.page || 1
      const limit = req.query.limit || 30

      const templatesQuery = this.createTemplatesQuery()

      templatesQuery.page(page as number)
      templatesQuery.limit(limit as number)

      if (req.query.licensee) {
        templatesQuery.filterByLicensee(req.query.licensee as string)
      }

      if (req.query.expression) {
        templatesQuery.filterByExpression(req.query.expression as string)
      }

      const templates = await templatesQuery.all()

      res.status(200).send(templates)
    } catch (err: any) {
      res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }

  async importation(req: Request, res: Response) {
    try {
      const templateImporter = this.createTemplatesImporter(req.params.id as string)
      await templateImporter.import()

      res.status(201).send({ body: 'OK' })
    } catch (err: any) {
      res.status(500).send({ errors: { message: `Erro interno do servidor: ${err.message}` } })
    }
  }
}

export { TemplatesController }
