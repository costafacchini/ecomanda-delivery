import Trigger from '@models/Trigger.js'
import QueryBuilder from '@queries/QueryBuilder.js'

class TriggersQuery {
  constructor() {}

  page(value) {
    this.pageClause = value
  }

  limit(value) {
    this.limitClause = value
  }

  filterByKind(value) {
    this.kindClause = value
  }

  filterByLicensee(value) {
    this.licenseeClause = value
  }

  filterByExpression(value) {
    this.expressionClause = value
  }

  async all() {
    const query = new QueryBuilder(Trigger)
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

export default TriggersQuery
