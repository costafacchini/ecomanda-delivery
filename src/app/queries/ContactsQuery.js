import QueryBuilder from '@queries/QueryBuilder.js'
import { ContactRepositoryDatabase  } from '@repositories/contact.js'

class ContactsQuery {
  constructor() {}

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

  async all() {
    const contactRepository = new ContactRepositoryDatabase()
    const query = new QueryBuilder(contactRepository.model())
    query.sortBy('createdAt', 1)

    if (this.pageClause) query.page(this.pageClause, this.limitClause)

    if (this.typeClause) query.filterBy('type', this.typeClause)

    if (this.talkingWithChatbotClause) query.filterBy('talkingWithChatBot', this.talkingWithChatbotClause)

    if (this.licenseeClause) query.filterBy('licensee', this.licenseeClause)

    if (this.expressionClause)
      query.filterByExpression(['name', 'email', 'number', 'waId', 'landbotId'], this.expressionClause)

    if (this.startDateClause && this.endDateClause)
      query.filterByInterval('wa_start_chat', this.startDateClause, this.endDateClause)

    if (!this.startDateClause && this.endDateClause) query.filterByLessThan('wa_start_chat', this.endDateClause)

    return await query.getQuery().exec()
  }
}

export default ContactsQuery
