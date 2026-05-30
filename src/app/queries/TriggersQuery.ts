import { QueryBuilder } from './QueryBuilder'

class TriggersQuery {
  triggerRepository: any
  pageClause: any
  limitClause: any
  kindClause: any
  licenseeClause: any
  expressionClause: any

  constructor({ triggerRepository }: { triggerRepository?: any } = {}) {
    this.triggerRepository = triggerRepository
  }

  page(value: any) {
    this.pageClause = value
  }

  limit(value: any) {
    this.limitClause = value
  }

  filterByKind(value: any) {
    this.kindClause = value
  }

  filterByLicensee(value: any) {
    this.licenseeClause = value
  }

  filterByExpression(value: any) {
    this.expressionClause = value
  }

  async all() {
    const query = new QueryBuilder(this.triggerRepository.model())
    query.sortBy('createdAt', 1)

    if (this.pageClause) query.page(this.pageClause, this.limitClause)

    if (this.kindClause) query.filterBy('triggerKind', this.kindClause)

    if (this.licenseeClause) query.filterBy('licensee', this.licenseeClause)

    if (this.expressionClause)
      query.filterByExpression(
        ['name', 'expression', 'catalogMulti', 'catalogSingle', 'textReplyButton', 'messagesList', 'text'],
        this.expressionClause,
      )

    return await query.getQuery().exec()
  }
}

export { TriggersQuery }
