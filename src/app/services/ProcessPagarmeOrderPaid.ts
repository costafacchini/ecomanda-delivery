import { logger } from '../helpers/logger'

async function processPagarmeOrderPaid(body: any, { cartRepository, createPagarMe }: Record<string, any> = {}) {
  const pagarMe = createPagarMe()
  const event = pagarMe.parser.parseOrderPaidEvent(body)

  const cart = await cartRepository.findFirst({ order_id: event.id })
  if (cart) {
    cart.payment_status = event.payment_status
    cart.integration_status = event.status

    await cartRepository.save(cart)
  } else {
    logger.info(`Carrinho não encontrado referente ao pagamento ${event.id} da pagar.me!`)
  }
}

export { processPagarmeOrderPaid }
