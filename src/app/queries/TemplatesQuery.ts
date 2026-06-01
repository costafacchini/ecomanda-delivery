import { QueryBuilder } from './QueryBuilder'

class TemplatesQuery {
  templateRepository: any
  pageClause: any
  limitClause: any
  licenseeClause: any
  expressionClause: any

  constructor({ templateRepository }: { templateRepository?: any } = {}) {
    this.templateRepository = templateRepository
  }

  page(value: any) {
    this.pageClause = value
  }

  limit(value: any) {
    this.limitClause = value
  }

  filterByLicensee(value: any) {
    this.licenseeClause = value
  }

  filterByExpression(value: any) {
    this.expressionClause = value
  }

  async all() {
    const query = new QueryBuilder(this.templateRepository.model())
    query.sortBy('createdAt', 1)

    if (this.pageClause) query.page(this.pageClause, this.limitClause)

    if (this.licenseeClause) query.filterBy('licensee', this.licenseeClause)

    if (this.expressionClause) query.filterByExpression(['name', 'namespace'], this.expressionClause)

    return await query.getQuery().exec()
  }
}

export { TemplatesQuery }
