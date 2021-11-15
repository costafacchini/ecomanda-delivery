const Contact = require('@models/Contact')
const QueryBuilder = require('@queries/QueryBuilder')

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

  async all() {
    const query = new QueryBuilder(Contact)
    query.sortBy('createdAt', 1)

    if (this.pageClause) query.page(this.pageClause, this.limitClause)

    if (this.typeClause) query.filterBy('type', this.typeClause)

    if (this.talkingWithChatbotClause) query.filterBy('talkingWithChatBot', this.talkingWithChatbotClause)

    if (this.licenseeClause) query.filterBy('licensee', this.licenseeClause)

    if (this.expressionClause)
      query.filterByExpression(['name', 'email', 'number', 'waId', 'landbotId'], this.expressionClause)

    return await query.getQuery().exec()
  }
}

module.exports = ContactsQuery
