import { scheduleSendMessageToMessenger  } from '@repositories/messenger.js'
import queueServer from '@config/queue.js'

jest.mock('@config/rabbitmq')

describe('#scheduleSendMessageToMessenger', () => {
  const queueSendMessageToMessenger = queueServer.queues.find((queue) => queue.name === 'send-message-to-messenger')

  beforeEach(async () => {
    await queueSendMessageToMessenger.bull.obliterate({ force: true })
  })

  afterEach(async () => {
    await queueSendMessageToMessenger.bull.obliterate({ force: true })
  })

  it('schedules a job to send message to messenger', async () => {
    await scheduleSendMessageToMessenger({ messageId: 'messageId', url: 'url', token: 'token' })

    const counts = await queueSendMessageToMessenger.bull.getJobCounts('wait')

    expect(counts.wait).toEqual(1)
  })
})
