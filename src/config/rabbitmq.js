import amqp from 'amqplib/callback_api'
const RABBIT_URL = process.env.CLOUDAMQP_URL
import jobs from '../app/jobs.js'

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

            const handleResult = await job.handle({ body: payload.body })
            if (handleResult) {
              for (const result of handleResult) {
                const { action, body } = result

                channel.sendToQueue('main', Buffer.from(JSON.stringify({ key: action, body })), { persistent: true })
              }
            }
          } finally {
            channel.ack(payloadBuffer)
          }
        },
        { noAck: false },
      )
    })
  })
}

export default { publishMessage, consumeChannel }
