const { scheduleSendMessageToMessenger, scheduleSendMessageToMessengerRabbit } = require('@repositories/messenger')
const queueServer = require('@config/queue')
const { publishMessage } = require('@config/rabbitmq')

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

describe('#scheduleSendMessageToMessengerRabbit', () => {
  it('schedules a job to send message to messenger in a RabbitMQ', async () => {
    await scheduleSendMessageToMessengerRabbit({ messageId: 'messageId', url: 'url', token: 'token' })

    expect(publishMessage).toHaveBeenCalledWith({
      key: 'send-message-to-messenger',
      body: { messageId: 'messageId', url: 'url', token: 'token' },
    })
  })
})
