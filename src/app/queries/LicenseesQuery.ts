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
  excludedIdsClause: any[] | undefined

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

  filterExcludeLicensees(ids: any[]) {
    this.excludedIdsClause = ids
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

    const mongooseQuery = query.getQuery()

    if (this.excludedIdsClause?.length) {
      mongooseQuery.where('_id').nin(this.excludedIdsClause)
    }

    return await mongooseQuery.exec()
  }
}

export { LicenseesQuery }
