const Message = require('@models/Message')
const QueryBuilder = require('@queries/QueryBuilder')

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

  async all() {
    const query = new QueryBuilder(Message)
    query.sortBy('createdAt', -1)

    if (this.pageClause) query.page(this.pageClause, this.limitClause)

    if (this.startDateClause && this.endDateClause)
      query.filterByInterval('createdAt', this.startDateClause, this.endDateClause)

    if (this.licenseeClause) query.filterBy('licensee', this.licenseeClause)

    if (this.contactClause) query.filterBy('contact', this.contactClause)

    if (this.kindClause) query.filterBy('kind', this.kindClause)

    if (this.destinationClause) query.filterBy('destination', this.destinationClause)

    if (this.sendedClause) query.filterBy('sended', this.sendedClause)

    return await query.getQuery().populate('contact').populate('cart').populate('trigger').exec()
  }
}

module.exports = MessagesQuery
