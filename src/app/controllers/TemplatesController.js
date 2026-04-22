import { sanitizeModelErrors } from '../helpers/SanitizeErrors.js'
import _ from 'lodash'

function permit(fields) {
  const permitedFields = ['name', 'namespace', 'licensee']

  return _.pick(fields, permitedFields)
}

class TemplatesController {
  constructor({ templateRepository, createTemplatesQuery, createTemplatesImporter } = {}) {
    this.templateRepository = templateRepository
    this.createTemplatesQuery = createTemplatesQuery
    this.createTemplatesImporter = createTemplatesImporter

    this.create = this.create.bind(this)
    this.update = this.update.bind(this)
    this.show = this.show.bind(this)
    this.index = this.index.bind(this)
    this.importation = this.importation.bind(this)
  }

  async create(req, res) {
    const { name, namespace, licensee } = req.body

    try {
      const template = await this.templateRepository.create({ name, namespace, licensee })

      res.status(201).send(template)
    } catch (err) {
      if ('errors' in err) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async update(req, res) {
    const fields = permit(req.body)
    delete fields.licensee

    try {
      await this.templateRepository.update(req.params.id, { ...fields })
    } catch (err) {
      return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
    }

    try {
      const template = await this.templateRepository.findFirst({ _id: req.params.id })

      res.status(200).send(template)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async show(req, res) {
    try {
      const template = await this.templateRepository.findFirst({ _id: req.params.id }, ['licensee'])

      res.status(200).send(template)
    } catch (err) {
      if (err.toString().includes('Cast to ObjectId failed for value')) {
        return res.status(404).send({ errors: { message: `Template ${req.params.id} não encontrado` } })
      } else {
        return res.status(500).send({ errors: { message: err.toString() } })
      }
    }
  }

  async index(req, res) {
    try {
      const page = req.query.page || 1
      const limit = req.query.limit || 30

      const templatesQuery = this.createTemplatesQuery()

      templatesQuery.page(page)
      templatesQuery.limit(limit)

      if (req.query.licensee) {
        templatesQuery.filterByLicensee(req.query.licensee)
      }

      if (req.query.expression) {
        templatesQuery.filterByExpression(req.query.expression)
      }

      const templates = await templatesQuery.all()

      res.status(200).send(templates)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async importation(req, res) {
    try {
      const templateImporter = this.createTemplatesImporter(req.params.id)
      await templateImporter.import()

      res.status(201).send({ body: 'OK' })
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }
}

export { TemplatesController }
