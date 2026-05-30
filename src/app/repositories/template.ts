import Repository, { RepositoryMemory, matchesFilter } from './repository'
import Template from '../models/Template'
import { requireDependency } from '../helpers/RequireDependency'

class TemplateRepositoryDatabase extends Repository {
  model() {
    return Template
  }

  async create(fields: any = {}) {
    const template = new Template({ ...(fields ?? {}) })

    return await this.save(template)
  }

  async delete(params: any = {}) {
    return await Template.deleteMany(params ?? {})
  }
}

class TemplateRepositoryMemory extends RepositoryMemory {
  async delete(params: any = {}) {
    const recordsToKeep = this.items.filter((item) => !matchesFilter(item, params ?? {}))
    this.items.splice(0, this.items.length, ...recordsToKeep)

    return await Promise.resolve({ acknowledged: true })
  }
}

async function destroyAllTemplates({ templateRepository }: { templateRepository?: any } = {}) {
  await requireDependency(templateRepository, 'templateRepository', 'destroyAllTemplates').delete({})
}

async function createTemplate(fields: any, { templateRepository }: { templateRepository?: any } = {}) {
  return await requireDependency(templateRepository, 'templateRepository', 'createTemplate').create(fields)
}

export { TemplateRepositoryDatabase, TemplateRepositoryMemory, createTemplate, destroyAllTemplates }
