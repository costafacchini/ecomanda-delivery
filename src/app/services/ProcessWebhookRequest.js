import Body from '../models/Body.js'

async function processWebhookRequest(data) {
  const { bodyId } = data

  const body = await Body.findById(bodyId)

  const actions = []

  if (body.content.provider && body.content.provider == 'pagarme') {
    actions.push({
      action: `process-pagarme-${body.content.type.replace('.', '-')}`,
      body: body.content,
    })
  }

  await Body.deleteOne({ _id: bodyId })

  return actions
}

export { processWebhookRequest }
