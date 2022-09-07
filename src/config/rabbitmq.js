const amqp = require('amqplib/callback_api')
const RABBIT_URL = process.env.CLOUDAMQP_URL
const resetChatbots = require('../app/services/ResetChatbots')

function publishMessage(payload) {
  amqp.connect(RABBIT_URL, function (errorOnConnect, connection) {
    if (errorOnConnect) throw errorOnConnect

    connection.createChannel(function (errorOnCreateChannel, channel) {
      if (errorOnCreateChannel) throw errorOnCreateChannel

      channel.assertQueue('main', { durable: true })

      channel.sendToQueue('main', Buffer.from(payload), { persistent: true })
    })

    setTimeout(function () {
      connection.close()
    }, 500)
  })
}

function consumeChannel() {
  amqp.connect(RABBIT_URL, function (errorOnConnect, connection) {
    if (errorOnConnect) throw errorOnConnect

    connection.createChannel(function (errorOnCreateChannel, channel) {
      if (errorOnCreateChannel) throw errorOnCreateChannel

      channel.assertQueue('main', { durable: true })

      channel.prefetch(1)

      channel.consume(
        'main',
        async function (payload) {
          try {
            await resetChatbots()
          } finally {
            channel.ack(payload)
          }
        },
        { noAck: false }
      )
    })
  })
}

module.exports = { publishMessage, consumeChannel }
