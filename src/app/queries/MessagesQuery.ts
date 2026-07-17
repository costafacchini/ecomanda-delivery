import { QueryBuilder } from './QueryBuilder'

class MessagesQuery {
  messageRepository: any
  pageClause: any
  limitClause: any
  startDateClause: any
  endDateClause: any
  licenseeClause: any
  contactClause: any
  kindClause: any
  destinationClause: any
  sendedClause: any
  sortByClause: any

  constructor({ messageRepository }: { messageRepository?: any } = {}) {
    this.messageRepository = messageRepository
  }

  page(value: any) {
    this.pageClause = value
  }

  limit(value: any) {
    this.limitClause = value
  }

  filterByCreatedAt(startDate: any, endDate: any) {
    this.startDateClause = startDate
    this.endDateClause = endDate
  }

  filterByLicensee(value: any) {
    this.licenseeClause = value
  }

  filterByContact(value: any) {
    this.contactClause = value
  }

  filterByKind(value: any) {
    this.kindClause = value
  }

  filterByDestination(value: any) {
    this.destinationClause = value
  }

  filterBySended(value: any) {
    this.sendedClause = value
  }

  sortBy(field: any, order: any) {
    this.sortByClause = {
      field,
      order,
    }
  }

  applyFilters(query: any) {
    if (this.pageClause) query.page(this.pageClause, this.limitClause)

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

  async all() {
    const query = new QueryBuilder(this.messageRepository.model())
    if (this.sortByClause) {
      query.sortBy(this.sortByClause.field, this.sortByClause.order)
    } else {
      query.sortBy('createdAt', -1)
    }
    this.applyFilters(query)

    return await query
      .getQuery()
      .populate('contact')
      .populate('cart')
      .populate('trigger')
      .populate('department', 'name')
      .exec()
  }

  async count() {
    const query = new QueryBuilder(this.messageRepository.model())
    this.applyFilters(query)

    return await query.getQuery().countDocuments()
  }
}

export { MessagesQuery }
