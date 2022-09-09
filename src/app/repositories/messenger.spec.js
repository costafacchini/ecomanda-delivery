const { scheduleSendMessageToMessenger } = require('@repositories/messenger')
const { publishMessage } = require('@config/rabbitmq')

jest.mock('@config/rabbitmq')

describe('#scheduleSendMessageToMessenger', () => {
  it('schedules a job to send message to messenger', () => {
    scheduleSendMessageToMessenger({ messageId: 'messageId', url: 'url', token: 'token' })

    expect(publishMessage).toHaveBeenCalledWith({
      key: 'send-message-to-messenger',
      body: { messageId: 'messageId', url: 'url', token: 'token' },
    })
  })
})
