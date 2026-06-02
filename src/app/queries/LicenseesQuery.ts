import { QueryBuilder } from './QueryBuilder'

class LicenseesQuery {
  licenseeRepository: any
  pageClause: any
  limitClause: any
  chatClause: any
  chatbotClause: any
  whatsappClause: any
  expressionClause: any
  expressionActive: any

  constructor({ licenseeRepository }: { licenseeRepository?: any } = {}) {
    this.licenseeRepository = licenseeRepository
  }

  page(value: any) {
    this.pageClause = value
  }

  limit(value: any) {
    this.limitClause = value
  }

  filterByChatDefault(value: any) {
    this.chatClause = value
  }

  filterByChatbotDefault(value: any) {
    this.chatbotClause = value
  }

  filterByWhatsappDefault(value: any) {
    this.whatsappClause = value
  }

  filterByExpression(value: any) {
    this.expressionClause = value
  }

  filterByActive() {
    this.expressionActive = true
  }

  async all() {
    const query = new QueryBuilder(this.licenseeRepository.model())
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

export { LicenseesQuery }
