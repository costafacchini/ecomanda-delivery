import { stringifyObjectIds } from '@repositories/repository'
import { IQueryableRepository } from './QueryBuilder'
import { IMessage } from '../../types'

class MessagesFailedQuery {
  startDate: Date | string
  endDate: Date | string
  licenseeId: string
  messageRepository: IQueryableRepository<IMessage> | undefined

  constructor(
    startDate: Date | string,
    endDate: Date | string,
    licenseeId: string,
    { messageRepository }: { messageRepository?: IQueryableRepository<IMessage> } = {},
  ) {
    this.startDate = startDate
    this.endDate = endDate
    this.licenseeId = licenseeId
    this.messageRepository = messageRepository
  }

  async all(): Promise<IMessage[]> {
    const docs = await this.messageRepository!
      .model()
      .find({
        sended: false,
        createdAt: {
          $gte: this.startDate,
          $lt: this.endDate,
        },
        licensee: this.licenseeId,
        text: {
          $ne: 'Chat encerrado pelo agente',
        },
      })
      .lean()
    return docs.map(stringifyObjectIds)
  }
}

export { MessagesFailedQuery }
