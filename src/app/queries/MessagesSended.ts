import { IRepository } from '@repositories/repository'
import { IMessage } from '../../types'

class MessagesSendedQuery {
  startDate: Date | string
  endDate: Date | string
  licenseeId: string
  messageRepository: IRepository<IMessage> | undefined

  constructor(
    startDate: Date | string,
    endDate: Date | string,
    licenseeId: string,
    { messageRepository }: { messageRepository?: IRepository<IMessage> } = {},
  ) {
    this.startDate = startDate
    this.endDate = endDate
    this.licenseeId = licenseeId
    this.messageRepository = messageRepository
  }

  async all(): Promise<IMessage[]> {
    return await this.messageRepository!.find({
      sended: true,
      createdAt: {
        $gte: this.startDate,
        $lt: this.endDate,
      },
      licensee: this.licenseeId,
    })
  }
}

export { MessagesSendedQuery }
