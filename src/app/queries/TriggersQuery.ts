import { QueryBuilder, IQueryableRepository } from './QueryBuilder'
import { stringifyObjectIds } from '@repositories/repository'
import { ITrigger } from '../../types'

class TriggersQuery {
  triggerRepository: IQueryableRepository<ITrigger> | undefined
  pageClause: number | undefined
  limitClause: number | undefined
  kindClause: string | undefined
  licenseeClause: string | undefined
  expressionClause: string | undefined

  constructor({ triggerRepository }: { triggerRepository?: IQueryableRepository<ITrigger> } = {}) {
    this.triggerRepository = triggerRepository
  }

  page(value: number) {
    this.pageClause = value
  }

  limit(value: number) {
    this.limitClause = value
  }

  filterByKind(value: string) {
    this.kindClause = value
  }

  filterByLicensee(value: string) {
    this.licenseeClause = value
  }

  filterByExpression(value: string) {
    this.expressionClause = value
  }

  async all(): Promise<ITrigger[]> {
    const query = new QueryBuilder(this.triggerRepository!.model())
    query.sortBy('createdAt', 1)

    if (this.pageClause) query.page(this.pageClause, this.limitClause!)

    if (this.kindClause) query.filterBy('triggerKind', this.kindClause)

    if (this.licenseeClause) query.filterBy('licensee', this.licenseeClause)

    if (this.expressionClause)
      query.filterByExpression(
        ['name', 'expression', 'catalogMulti', 'catalogSingle', 'textReplyButton', 'messagesList', 'text'],
        this.expressionClause,
      )

    const docs = await query.getQuery().lean().exec()
    return docs.map(stringifyObjectIds)
  }
}

export { TriggersQuery }
