import Template from '@models/Template'
import { sanitizeModelErrors } from '@helpers/SanitizeErrors'
import _ from 'lodash'
import TemplatesQuery from '@queries/TemplatesQuery'
import TemplatesImporter from '@plugins/importers/template/index'

function permit(fields) {
  const permitedFields = ['name', 'namespace', 'licensee']

  return _.pick(fields, permitedFields)
}

class TemplatesController {
  async create(req, res) {
    const { name, namespace, licensee } = req.body

    const template = new Template({
      name,
      namespace,
      licensee,
    })

    const validation = template.validateSync()

    try {
      if (validation) {
        return res.status(422).json({ errors: sanitizeModelErrors(validation.errors) })
      } else {
        await template.save()
      }

      res.status(201).send(template)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async update(req, res) {
    const fields = permit(req.body)
    delete fields.licensee

    try {
      await Template.updateOne({ _id: req.params.id }, { $set: fields }, { runValidators: true })
    } catch (err) {
      return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
    }

    try {
      const template = await Template.findOne({ _id: req.params.id })

      res.status(200).send(template)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }

  async show(req, res) {
    try {
      const template = await Template.findOne({ _id: req.params.id }).populate('licensee')

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

      const templatesQuery = new TemplatesQuery()

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
      const templateImporter = new TemplatesImporter(req.params.id)
      await templateImporter.import()

      res.status(201).send({ body: 'OK' })
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }
}

export default TemplatesController
