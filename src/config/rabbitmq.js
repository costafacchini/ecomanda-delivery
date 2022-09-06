const amqp = require('amqplib/callback_api')
const RABBIT_URL = process.env.CLOUDAMQP_URL
const resetChatbots = require('../app/services/ResetChatbots')

function publishMessage(payload) {
  amqp.connect(RABBIT_URL, function (errorOnConnect, connection) {
    if (errorOnConnect) throw errorOnConnect

    connection.createChannel(function (errorOnCreateChannel, channel) {
      if (errorOnCreateChannel) throw errorOnCreateChannel

      channel.assertQueue('main', { durable: false })

      channel.sendToQueue('main', Buffer.from(payload))
    })

    connection.close()
  })
}

function consumeChannel() {
  amqp.connect(RABBIT_URL, function (errorOnConnect, connection) {
    if (errorOnConnect) throw errorOnConnect

    connection.createChannel(function (errorOnCreateChannel, channel) {
      if (errorOnCreateChannel) throw errorOnCreateChannel

      channel.assertQueue('main', { durable: false })

      channel.consume(
        'main',
        async function (_) {
          await resetChatbots()
        },
        { noAck: true }
      )
    })
  })
}

module.exports = { publishMessage, consumeChannel }
