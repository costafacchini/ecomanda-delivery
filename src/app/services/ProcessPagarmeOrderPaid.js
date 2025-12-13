import { PagarMe } from '../plugins/payments/PagarMe.js'
import { CartRepositoryDatabase } from '../repositories/cart.js'
import { logger } from '../../setup/logger.js'

async function processPagarmeOrderPaid(body) {
  const pagarMe = new PagarMe()
  const event = pagarMe.parser.parseOrderPaidEvent(body)

  const cartRepository = new CartRepositoryDatabase()
  const cart = await cartRepository.findFirst({ order_id: event.id })
  if (cart) {
    cart.payment_status = event.payment_status
    cart.integration_status = event.status

    await cart.save()
  } else {
    logger.info(`Carrinho não encontrado referente ao pagamento ${event.id} da pagar.me!`)
  }
}

export { processPagarmeOrderPaid }
