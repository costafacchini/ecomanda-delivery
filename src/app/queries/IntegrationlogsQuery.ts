import { QueryBuilder } from './QueryBuilder'

class IntegrationlogsQuery {
  integrationlogRepository: any
  startDateClause: any
  endDateClause: any
  licenseeClause: any
  sortByClause: any

  constructor({ integrationlogRepository }: { integrationlogRepository?: any } = {}) {
    this.integrationlogRepository = integrationlogRepository
  }

  filterByCreatedAt(startDate: any, endDate: any) {
    this.startDateClause = startDate
    this.endDateClause = endDate
  }

  filterByLicensee(value: any) {
    this.licenseeClause = value
  }

  sortBy(field: any, order: any) {
    this.sortByClause = {
      field,
      order,
    }
  }

  applyFilters(query: any) {
    if (this.startDateClause && this.endDateClause)
      query.filterByInterval('createdAt', this.startDateClause, this.endDateClause)

    if (this.licenseeClause) query.filterBy('licensee', this.licenseeClause)
  }

  async all() {
    const query = new QueryBuilder(this.integrationlogRepository.model())
    if (this.sortByClause) {
      query.sortBy(this.sortByClause.field, this.sortByClause.order)
    } else {
      query.sortBy('createdAt', -1)
    }
    this.applyFilters(query)

    return await query.getQuery().populate('contact').populate('cart').populate('licensee').exec()
  }
}

export { IntegrationlogsQuery }
