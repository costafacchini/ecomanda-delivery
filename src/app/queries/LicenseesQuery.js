const QueryBuilder = require('@queries/QueryBuilder')
const { LicenseeRepositoryDatabase } = require('@repositories/licensee')

class LicenseesQuery {
  constructor() {}

  page(value) {
    this.pageClause = value
  }

  limit(value) {
    this.limitClause = value
  }

  filterByChatDefault(value) {
    this.chatClause = value
  }

  filterByChatbotDefault(value) {
    this.chatbotClause = value
  }

  filterByWhatsappDefault(value) {
    this.whatsappClause = value
  }

  filterByExpression(value) {
    this.expressionClause = value
  }

  filterByActive() {
    this.expressionActive = true
  }

  async all() {
    const licenseeRepository = new LicenseeRepositoryDatabase()
    const query = new QueryBuilder(licenseeRepository.model())
    query.sortBy('createdAt', 1)

    if (this.pageClause) query.page(this.pageClause, this.limitClause)

    if (this.chatClause) query.filterBy('chatDefault', this.chatClause)

    if (this.chatbotClause) query.filterBy('chatbotDefault', this.chatbotClause)

    if (this.whatsappClause) query.filterBy('whatsappDefault', this.whatsappClause)

    if (this.expressionActive) query.filterBy('active', this.expressionActive)

    if (this.expressionClause) query.filterByExpression(['name', 'email', 'phone'], this.expressionClause)

    return await query.getQuery().exec()
  }
}

module.exports = LicenseesQuery
