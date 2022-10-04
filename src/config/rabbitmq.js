const amqp = require('amqplib/callback_api')
const RABBIT_URL = process.env.CLOUDAMQP_URL
const jobs = require('../app/jobs')

function publishMessage(payload) {
  amqp.connect(RABBIT_URL, function (errorOnConnect, connection) {
    if (errorOnConnect) throw errorOnConnect

    connection.createChannel(function (errorOnCreateChannel, channel) {
      if (errorOnCreateChannel) throw errorOnCreateChannel

      channel.assertQueue('main', { durable: true })

      channel.sendToQueue('main', Buffer.from(JSON.stringify(payload)), { persistent: true })
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
        async function (payloadBuffer) {
          try {
            const payload = JSON.parse(payloadBuffer.content.toString())
            const job = Object.values(jobs).find((job) => job.key === payload.key)

            await job.handle({ body: payload.body })
          } finally {
            channel.ack(payloadBuffer)
          }
        },
        { noAck: false }
      )
    })
  })
}

module.exports = { publishMessage, consumeChannel }
