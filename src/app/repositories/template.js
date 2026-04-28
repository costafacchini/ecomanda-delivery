import Repository, { RepositoryMemory, matchesFilter } from './repository.js'
import Template from '../models/Template.js'
import { requireDependency } from '../helpers/RequireDependency.js'

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

async function destroyAllTemplates({ templateRepository } = {}) {
  await requireDependency(templateRepository, 'templateRepository', 'destroyAllTemplates').delete({})
}

async function createTemplate(fields, { templateRepository } = {}) {
  return await requireDependency(templateRepository, 'templateRepository', 'createTemplate').create(fields)
}

export { TemplateRepositoryDatabase, TemplateRepositoryMemory, createTemplate, destroyAllTemplates }
