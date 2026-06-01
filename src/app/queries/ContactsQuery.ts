import { QueryBuilder } from './QueryBuilder'

class ContactsQuery {
  contactRepository: any
  pageClause: any
  limitClause: any
  typeClause: any
  talkingWithChatbotClause: any
  licenseeClause: any
  expressionClause: any
  startDateClause: any
  endDateClause: any
  isGroupClause: any
  updatedAtStartClause: any
  updatedAtEndClause: any

  constructor({ contactRepository }: { contactRepository?: any } = {}) {
    this.contactRepository = contactRepository
  }

  page(value: any) {
    this.pageClause = value
  }

  limit(value: any) {
    this.limitClause = value
  }

  filterByType(value: any) {
    this.typeClause = value
  }

  filterByTalkingWithChatbot(value: any) {
    this.talkingWithChatbotClause = value
  }

  filterByLicensee(value: any) {
    this.licenseeClause = value
  }

  filterByExpression(value: any) {
    this.expressionClause = value
  }

  filterIntervalWaStartChat(startDate: any, endDate: any) {
    this.startDateClause = startDate
    this.endDateClause = endDate
  }

  filterWaStartChatLessThan(endDate: any) {
    this.endDateClause = endDate
  }

  filterByIsGroup(value: any) {
    this.isGroupClause = value
  }

  filterByUpdatedAtStart(value: any) {
    this.updatedAtStartClause = value
  }

  filterByUpdatedAtEnd(value: any) {
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
