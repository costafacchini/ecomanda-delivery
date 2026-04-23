import Repository, { RepositoryMemory, matchesFilter } from './repository.js'
import Template from '../models/Template.js'

class TemplateRepositoryDatabase extends Repository {
  model() {
    return Template
  }

  async create(fields = {}) {
    const template = new Template({ ...(fields ?? {}) })

    return await this.save(template)
  }

  async delete(params = {}) {
    return await Template.deleteMany(params ?? {})
  }
}

class TemplateRepositoryMemory extends RepositoryMemory {
  async delete(params = {}) {
    const recordsToKeep = this.items.filter((item) => !matchesFilter(item, params ?? {}))
    this.items.splice(0, this.items.length, ...recordsToKeep)

    return await Promise.resolve({ acknowledged: true })
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

export { TemplateRepositoryDatabase, TemplateRepositoryMemory, createTemplate, destroyAllTemplates }
