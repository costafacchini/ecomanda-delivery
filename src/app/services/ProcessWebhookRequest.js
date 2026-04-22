import { BodyRepositoryDatabase } from '../repositories/body.js'

async function processWebhookRequest(data, { bodyRepository = new BodyRepositoryDatabase() } = {}) {
  const { bodyId } = data

  const body = await bodyRepository.findFirst({ _id: bodyId })

  const actions = []

  if (body.content.provider && body.content.provider == 'pagarme') {
    actions.push({
      action: `process-pagarme-${body.content.type.replace('.', '-')}`,
      body: body.content,
    })
  }

  await bodyRepository.delete({ _id: bodyId })

  return actions
}

export { processWebhookRequest }
