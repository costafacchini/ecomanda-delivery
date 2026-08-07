import { QueryBuilder, IQueryableRepository } from './QueryBuilder'
import { stringifyObjectIds } from '@repositories/repository'
import { IContact } from '../../types'

class ContactsQuery {
  contactRepository: IQueryableRepository<IContact> | undefined
  pageClause: number | undefined
  limitClause: number | undefined
  typeClause: string | undefined
  talkingWithChatbotClause: boolean | undefined
  licenseeClause: string | undefined
  expressionClause: string | undefined
  startDateClause: Date | string | undefined
  endDateClause: Date | string | undefined
  isGroupClause: boolean | undefined
  updatedAtStartClause: Date | string | undefined
  updatedAtEndClause: Date | string | undefined

  constructor({ contactRepository }: { contactRepository?: IQueryableRepository<IContact> } = {}) {
    this.contactRepository = contactRepository
  }

  page(value: number) {
    this.pageClause = value
  }

  limit(value: number) {
    this.limitClause = value
  }

  filterByType(value: string) {
    this.typeClause = value
  }

  filterByTalkingWithChatbot(value: boolean) {
    this.talkingWithChatbotClause = value
  }

  filterByLicensee(value: string) {
    this.licenseeClause = value
  }

  filterByExpression(value: string) {
    this.expressionClause = value
  }

  filterIntervalWaStartChat(startDate: Date | string, endDate: Date | string) {
    this.startDateClause = startDate
    this.endDateClause = endDate
  }

  filterWaStartChatLessThan(endDate: Date | string) {
    this.endDateClause = endDate
  }

  filterByIsGroup(value: boolean) {
    this.isGroupClause = value
  }

  filterByUpdatedAtStart(value: Date | string) {
    this.updatedAtStartClause = value
  }

  filterByUpdatedAtEnd(value: Date | string) {
    this.updatedAtEndClause = value
  }

  async all(): Promise<IContact[]> {
    const query = new QueryBuilder(this.contactRepository!.model())
    query.sortBy('createdAt', 1)
    query.filterNotEqual('active', false)

    if (this.pageClause) query.page(this.pageClause, this.limitClause!)

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

    const docs = await query.getQuery().lean().exec()
    return docs.map(stringifyObjectIds)
  }
}

export { ContactsQuery }
