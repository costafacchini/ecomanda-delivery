import Template from '@models/Template'
import QueryBuilder from '@queries/QueryBuilder'

class TemplatesQuery {
  constructor() {}

  page(value) {
    this.pageClause = value
  }

  limit(value) {
    this.limitClause = value
  }

  filterByLicensee(value) {
    this.licenseeClause = value
  }

  filterByExpression(value) {
    this.expressionClause = value
  }

  async all() {
    const query = new QueryBuilder(Template)
    query.sortBy('createdAt', 1)

    if (this.pageClause) query.page(this.pageClause, this.limitClause)

    if (this.licenseeClause) query.filterBy('licensee', this.licenseeClause)

    if (this.expressionClause) query.filterByExpression(['name', 'namespace'], this.expressionClause)

    return await query.getQuery().exec()
  }
}

export default TemplatesQuery
