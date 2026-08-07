import { QueryBuilder, IQueryableRepository } from './QueryBuilder'
import { stringifyObjectIds } from '@repositories/repository'
import { IMessage } from '../../types'

interface MessagesQueryDeps {
  messageRepository?: IQueryableRepository<IMessage>
}

interface SortClause {
  field: string
  order: number
}

class MessagesQuery {
  messageRepository: IQueryableRepository<IMessage> | undefined
  pageClause: number | undefined
  limitClause: number | undefined
  startDateClause: Date | string | undefined
  endDateClause: Date | string | undefined
  licenseeClause: string | undefined
  contactClause: string | undefined
  kindClause: string | undefined
  destinationClause: string | undefined
  sendedClause: boolean | undefined
  sortByClause: SortClause | undefined

  constructor({ messageRepository }: MessagesQueryDeps = {}) {
    this.messageRepository = messageRepository
  }

  page(value: number) {
    this.pageClause = value
  }

  limit(value: number) {
    this.limitClause = value
  }

  filterByCreatedAt(startDate: Date | string, endDate: Date | string) {
    this.startDateClause = startDate
    this.endDateClause = endDate
  }

  filterByLicensee(value: string) {
    this.licenseeClause = value
  }

  filterByContact(value: string) {
    this.contactClause = value
  }

  filterByKind(value: string) {
    this.kindClause = value
  }

  filterByDestination(value: string) {
    this.destinationClause = value
  }

  filterBySended(value: boolean) {
    this.sendedClause = value
  }

  sortBy(field: string, order: number) {
    this.sortByClause = {
      field,
      order,
    }
  }

  applyFilters(query: QueryBuilder) {
    if (this.pageClause) query.page(this.pageClause, this.limitClause!)

    if (this.startDateClause && this.endDateClause)
      query.filterByInterval('createdAt', this.startDateClause, this.endDateClause)

    if (this.licenseeClause) query.filterBy('licensee', this.licenseeClause)

    if (this.contactClause) query.filterBy('contact', this.contactClause)

    if (this.kindClause) query.filterBy('kind', this.kindClause)

    if (this.destinationClause) query.filterBy('destination', this.destinationClause)

    if (this.sendedClause) {
      query.filterBy('sended', this.sendedClause)
      query.filterNotEqual('text', 'Chat encerrado pelo agente')
      query.filterNotEqual('ignored', true)
    }
  }

  async all(): Promise<IMessage[]> {
    const query = new QueryBuilder(this.messageRepository!.model())
    if (this.sortByClause) {
      query.sortBy(this.sortByClause.field, this.sortByClause.order)
    } else {
      query.sortBy('createdAt', -1)
    }
    this.applyFilters(query)

    const docs = await query
      .getQuery()
      .populate('contact')
      .populate('trigger')
      .populate('department', 'name')
      .lean()
      .exec()
    return docs.map(stringifyObjectIds)
  }

  async count(): Promise<number> {
    const query = new QueryBuilder(this.messageRepository!.model())
    this.applyFilters(query)

    return await query.getQuery().countDocuments()
  }
}

export { MessagesQuery }
