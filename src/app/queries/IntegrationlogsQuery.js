import Integrationlog from '@models/Integrationlog'
import QueryBuilder from '@queries/QueryBuilder'

class IntegrationlogsQuery {
  constructor() {}

  filterByCreatedAt(startDate, endDate) {
    this.startDateClause = startDate
    this.endDateClause = endDate
  }

  filterByLicensee(value) {
    this.licenseeClause = value
  }

  sortBy(field, order) {
    this.sortByClause = {
      field,
      order,
    }
  }

  applyFilters(query) {
    if (this.startDateClause && this.endDateClause)
      query.filterByInterval('createdAt', this.startDateClause, this.endDateClause)

    if (this.licenseeClause) query.filterBy('licensee', this.licenseeClause)
  }

  async all() {
    const query = new QueryBuilder(Integrationlog)
    if (this.sortByClause) {
      query.sortBy(this.sortByClause.field, this.sortByClause.order)
    } else {
      query.sortBy('createdAt', -1)
    }
    this.applyFilters(query)

    return await query.getQuery().populate('contact').populate('cart').populate('licensee').exec()
  }
}

export default IntegrationlogsQuery
