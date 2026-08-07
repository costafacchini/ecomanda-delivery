import { IRepository } from '@repositories/repository'
import { IBody } from '../../../types'
import { IQueueServer } from '@config/queue'

const CHAT_MESSAGE_KIND = 'normal'
const CHAT_MESSAGE_JOB = 'chat-message'

interface IngestChatMessageDeps {
  chatRepository: IRepository<IBody>
  jobQueue: IQueueServer
}

interface IngestChatMessageInput {
  body: Record<string, any>
  licenseeId: string
  inboxId?: string | null
}

class IngestChatMessage {
  chatRepository: IRepository<IBody>
  jobQueue: IngestChatMessageDeps['jobQueue']

  constructor({ chatRepository, jobQueue }: IngestChatMessageDeps) {
    this.chatRepository = chatRepository
    this.jobQueue = jobQueue
  }

  async execute({ body, licenseeId, inboxId = null }: IngestChatMessageInput): Promise<IBody> {
    // Remove crmData because of Rocketchat sending a higher history inside the body
    delete body['crmData']

    const bodySaved = await this.chatRepository.create({
      content: body,
      licensee: licenseeId,
      kind: CHAT_MESSAGE_KIND,
      inbox: inboxId,
    })

    await this.jobQueue.addJob(CHAT_MESSAGE_JOB, {
      bodyId: bodySaved._id,
      licenseeId,
    })

    return bodySaved
  }
}

export { CHAT_MESSAGE_KIND, CHAT_MESSAGE_JOB, IngestChatMessage }
