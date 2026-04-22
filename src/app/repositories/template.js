import Repository from './repository.js'
import Template from '../models/Template.js'

class TemplateRepositoryDatabase extends Repository {
  model() {
    return Template
  }

  async create(fields = {}) {
    const template = new Template({ ...(fields ?? {}) })

    return await template.save()
  }

  async delete(params = {}) {
    return await Template.deleteMany(params ?? {})
  }
}

async function destroyAllTemplates() {
  const templateRepository = new TemplateRepositoryDatabase()
  await templateRepository.delete({})
}

async function createTemplate(fields) {
  const templateRepository = new TemplateRepositoryDatabase()
  return await templateRepository.create(fields)
}

export { TemplateRepositoryDatabase, createTemplate, destroyAllTemplates }
