import { QueryBuilder, IQueryableRepository } from './QueryBuilder'
import { stringifyObjectIds } from '@repositories/repository'
import { ITemplate } from '../../types'

class TemplatesQuery {
  templateRepository: IQueryableRepository<ITemplate> | undefined
  pageClause: number | undefined
  limitClause: number | undefined
  licenseeClause: string | undefined
  expressionClause: string | undefined

  constructor({ templateRepository }: { templateRepository?: IQueryableRepository<ITemplate> } = {}) {
    this.templateRepository = templateRepository
  }

  page(value: number) {
    this.pageClause = value
  }

  limit(value: number) {
    this.limitClause = value
  }

  filterByLicensee(value: string) {
    this.licenseeClause = value
  }

  filterByExpression(value: string) {
    this.expressionClause = value
  }

  async all(): Promise<ITemplate[]> {
    const query = new QueryBuilder(this.templateRepository!.model())
    query.sortBy('createdAt', 1)

    if (this.pageClause) query.page(this.pageClause, this.limitClause!)

    if (this.licenseeClause) query.filterBy('licensee', this.licenseeClause)

    if (this.expressionClause) query.filterByExpression(['name', 'namespace'], this.expressionClause)

    const docs = await query.getQuery().lean().exec()
    return docs.map(stringifyObjectIds)
  }
}

export { TemplatesQuery }
