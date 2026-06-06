import { QueryBuilder } from './QueryBuilder'

class UsersQuery {
  userRepository: any
  pageClause: any
  limitClause: any
  licenseeClause: any
  expressionClause: any
  expressionActive: any

  constructor({ userRepository }: { userRepository?: any } = {}) {
    this.userRepository = userRepository
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
    const query = new QueryBuilder(this.userRepository.model())
    query.sortBy('createdAt', 1)

    if (this.pageClause) query.page(this.pageClause, this.limitClause)

    if (this.licenseeClause) query.filterBy('licensee', this.licenseeClause)

    if (this.expressionClause) query.filterByExpression(['name', 'email'], this.expressionClause)

    return await query.getQuery().exec()
  }
}

export { UsersQuery }
