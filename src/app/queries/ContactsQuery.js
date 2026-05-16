import { QueryBuilder } from './QueryBuilder.js'

class ContactsQuery {
  constructor({ contactRepository } = {}) {
    this.contactRepository = contactRepository
  }

  page(value) {
    this.pageClause = value
  }

  limit(value) {
    this.limitClause = value
  }

  filterByType(value) {
    this.typeClause = value
  }

  filterByTalkingWithChatbot(value) {
    this.talkingWithChatbotClause = value
  }

  filterByLicensee(value) {
    this.licenseeClause = value
  }

  filterByExpression(value) {
    this.expressionClause = value
  }

  filterIntervalWaStartChat(startDate, endDate) {
    this.startDateClause = startDate
    this.endDateClause = endDate
  }

  filterWaStartChatLessThan(endDate) {
    this.endDateClause = endDate
  }

  filterByIsGroup(value) {
    this.isGroupClause = value
  }

  filterByUpdatedAtStart(value) {
    this.updatedAtStartClause = value
  }

  filterByUpdatedAtEnd(value) {
    this.updatedAtEndClause = value
  }

  async all() {
    const query = new QueryBuilder(this.contactRepository.model())
    query.sortBy('createdAt', 1)
    query.filterNotEqual('active', false)

    if (this.pageClause) query.page(this.pageClause, this.limitClause)

    if (this.typeClause) query.filterBy('type', this.typeClause)

    if (this.talkingWithChatbotClause) query.filterBy('talkingWithChatBot', this.talkingWithChatbotClause)

    if (this.licenseeClause) query.filterBy('licensee', this.licenseeClause)

    if (this.expressionClause)
      query.filterByExpression(['name', 'email', 'number', 'waId', 'landbotId'], this.expressionClause)

    if (this.startDateClause && this.endDateClause)
      query.filterByInterval('wa_start_chat', this.startDateClause, this.endDateClause)

    if (!this.startDateClause && this.endDateClause) query.filterByLessThan('wa_start_chat', this.endDateClause)

    if (this.isGroupClause !== undefined) query.filterBy('isGroup', this.isGroupClause)

    if (this.updatedAtStartClause && this.updatedAtEndClause)
      query.filterByInterval('updatedAt', this.updatedAtStartClause, this.updatedAtEndClause)

    if (this.updatedAtStartClause && !this.updatedAtEndClause)
      query.filterByGreaterThan('updatedAt', this.updatedAtStartClause)

    if (!this.updatedAtStartClause && this.updatedAtEndClause)
      query.filterByLessThan('updatedAt', this.updatedAtEndClause)

    return await query.getQuery().exec()
  }
}

export { ContactsQuery }
