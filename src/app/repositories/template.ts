import Repository, { RepositoryMemory, matchesFilter, stringifyObjectIds } from './repository'
import Template from '../models/Template'
import { requireDependency } from '../helpers/RequireDependency'
import { ITemplate } from '../../types'

class TemplateRepositoryDatabase extends Repository<ITemplate> {
  model() {
    return Template
  }

  async create(fields: any = {}): Promise<ITemplate> {
    const doc = await this.save(new Template({ ...(fields ?? {}) }))
    return stringifyObjectIds(doc.toObject()) as ITemplate
  }

  async delete(params: any = {}) {
    return await Template.deleteMany(params ?? {})
  }
}

class TemplateRepositoryMemory extends RepositoryMemory<ITemplate> {
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
