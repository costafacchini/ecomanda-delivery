const { scheduleSendMessageToMessenger } = require('@repositories/messenger')
const queueServer = require('@config/queue')

describe('#scheduleSendMessageToMessenger', () => {
  const queueSendMessageToMessenger = queueServer.queues.find((queue) => queue.name === 'send-message-to-messenger')

  afterEach(() => {
    queueSendMessageToMessenger.bull.obliterate({ force: true })
  })
  it('schedules a job to send message to messenger', async () => {
    await scheduleSendMessageToMessenger({ messageId: 'messageId', url: 'url', token: 'token' })

    const counts = await queueSendMessageToMessenger.bull.getJobCounts('wait')

    expect(counts.wait).toEqual(1)
  })
})
