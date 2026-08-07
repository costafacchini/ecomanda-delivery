import { QueryBuilder, IQueryableRepository } from './QueryBuilder'
import { stringifyObjectIds } from '@repositories/repository'
import { IUser } from '../../types'

class UsersQuery {
  userRepository: IQueryableRepository<IUser> | undefined
  pageClause: number | undefined
  limitClause: number | undefined
  licenseeClause: string | undefined
  expressionClause: string | undefined
  expressionActive: boolean | undefined

  constructor({ userRepository }: { userRepository?: IQueryableRepository<IUser> } = {}) {
    this.userRepository = userRepository
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

  async all(): Promise<IUser[]> {
    const query = new QueryBuilder(this.userRepository!.model())
    query.sortBy('createdAt', 1)

    if (this.pageClause) query.page(this.pageClause, this.limitClause!)

    if (this.licenseeClause) query.filterBy('licensee', this.licenseeClause)

    if (this.expressionClause) query.filterByExpression(['name', 'email'], this.expressionClause)

    const docs = await query.getQuery().lean().exec()
    return docs.map(stringifyObjectIds)
  }
}

export { UsersQuery }
