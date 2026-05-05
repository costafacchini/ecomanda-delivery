const CHAT_MESSAGE_KIND = 'normal'
const CHAT_MESSAGE_JOB = 'chat-message'

class IngestChatMessage {
  constructor({ chatRepository, jobQueue } = {}) {
    this.chatRepository = chatRepository
    this.jobQueue = jobQueue
  }

  async execute({ body, licenseeId } = {}) {
    // Remove crmData because of Rocketchat sending a higher history inside the body
    delete body['crmData']

    const bodySaved = await this.chatRepository.create({
      content: body,
      licensee: licenseeId,
      kind: CHAT_MESSAGE_KIND,
    })

    await this.jobQueue.addJob(CHAT_MESSAGE_JOB, {
      bodyId: bodySaved._id,
      licenseeId,
    })

    return bodySaved
  }
}

export { CHAT_MESSAGE_KIND, CHAT_MESSAGE_JOB, IngestChatMessage }
