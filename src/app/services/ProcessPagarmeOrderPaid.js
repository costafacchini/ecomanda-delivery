import { PagarMe } from '../plugins/payments/PagarMe.js'
import { CartRepositoryDatabase } from '../repositories/cart.js'

async function processPagarmeOrderPaid(
  body,
  { cartRepository = new CartRepositoryDatabase(), pagarMe = new PagarMe() } = {},
) {
  const event = pagarMe.parser.parseOrderPaidEvent(body)

  const cart = await cartRepository.findFirst({ order_id: event.id })
  if (cart) {
    cart.payment_status = event.payment_status
    cart.integration_status = event.status

    await cartRepository.save(cart)
  } else {
    console.info(`Carrinho não encontrado referente ao pagamento ${event.id} da pagar.me!`)
  }
}

export { processPagarmeOrderPaid }
