const MESSENGER_MESSAGE_KIND = 'normal'
const MESSENGER_MESSAGE_JOB = 'messenger-message'

class IngestMessengerMessage {
  constructor({ messengerRepository, jobQueue } = {}) {
    this.messengerRepository = messengerRepository
    this.jobQueue = jobQueue
  }

  async execute({ body, licenseeId } = {}) {
    const bodySaved = await this.messengerRepository.create({
      content: body,
      licensee: licenseeId,
      kind: MESSENGER_MESSAGE_KIND,
    })

    await this.jobQueue.addJob(MESSENGER_MESSAGE_JOB, {
      bodyId: bodySaved._id,
      licenseeId,
    })

    return bodySaved
  }
}

export { MESSENGER_MESSAGE_KIND, MESSENGER_MESSAGE_JOB, IngestMessengerMessage }
