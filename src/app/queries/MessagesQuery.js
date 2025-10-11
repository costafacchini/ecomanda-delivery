import { MessageRepositoryDatabase } from '@repositories/message'
import QueryBuilder from '@queries/QueryBuilder'

class MessagesQuery {
  constructor() {}

  page(value) {
    this.pageClause = value
  }

  limit(value) {
    this.limitClause = value
  }

  filterByCreatedAt(startDate, endDate) {
    this.startDateClause = startDate
    this.endDateClause = endDate
  }

  filterByLicensee(value) {
    this.licenseeClause = value
  }

  filterByContact(value) {
    this.contactClause = value
  }

  filterByKind(value) {
    this.kindClause = value
  }

  filterByDestination(value) {
    this.destinationClause = value
  }

  filterBySended(value) {
    this.sendedClause = value
  }

  sortBy(field, order) {
    this.sortByClause = {
      field,
      order,
    }
  }

  applyFilters(query) {
    if (this.pageClause) query.page(this.pageClause, this.limitClause)

    if (this.startDateClause && this.endDateClause)
      query.filterByInterval('createdAt', this.startDateClause, this.endDateClause)

    if (this.licenseeClause) query.filterBy('licensee', this.licenseeClause)

    if (this.contactClause) query.filterBy('contact', this.contactClause)

    if (this.kindClause) query.filterBy('kind', this.kindClause)

    if (this.destinationClause) query.filterBy('destination', this.destinationClause)

    if (this.sendedClause) query.filterBy('sended', this.sendedClause)
  }

  async all() {
    const messageRepository = new MessageRepositoryDatabase()
    const query = new QueryBuilder(messageRepository.model())
    if (this.sortByClause) {
      query.sortBy(this.sortByClause.field, this.sortByClause.order)
    } else {
      query.sortBy('createdAt', -1)
    }
    this.applyFilters(query)

    return await query.getQuery().populate('contact').populate('cart').populate('trigger').exec()
  }

  async count() {
    const messageRepository = new MessageRepositoryDatabase()
    const query = new QueryBuilder(messageRepository.model())
    this.applyFilters(query)

    return await query.getQuery().countDocuments()
  }
}

export default MessagesQuery
