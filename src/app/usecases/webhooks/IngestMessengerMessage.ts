import { IRepository } from '@repositories/repository'
import { IBody } from '../../../types'

const MESSENGER_MESSAGE_KIND = 'normal'
const MESSENGER_MESSAGE_JOB = 'messenger-message'

interface IngestMessengerMessageDeps {
  messengerRepository: IRepository<IBody>
  jobQueue: { addJob(name: string, payload: Record<string, any>): Promise<any> }
}

interface IngestMessengerMessageInput {
  body: Record<string, any>
  licenseeId: string
  departmentId?: string | null
  inboxId?: string | null
}

class IngestMessengerMessage {
  messengerRepository: IRepository<IBody>
  jobQueue: IngestMessengerMessageDeps['jobQueue']

  constructor({ messengerRepository, jobQueue }: IngestMessengerMessageDeps) {
    this.messengerRepository = messengerRepository
    this.jobQueue = jobQueue
  }

  async execute({ body, licenseeId, departmentId = null, inboxId = null }: IngestMessengerMessageInput): Promise<IBody> {
    const bodySaved = await this.messengerRepository.create({
      content: body,
      licensee: licenseeId,
      kind: MESSENGER_MESSAGE_KIND,
      department: departmentId,
      inbox: inboxId,
    })

    await this.jobQueue.addJob(MESSENGER_MESSAGE_JOB, {
      bodyId: bodySaved._id,
      licenseeId,
    })

    return bodySaved
  }
}

export { MESSENGER_MESSAGE_KIND, MESSENGER_MESSAGE_JOB, IngestMessengerMessage }
