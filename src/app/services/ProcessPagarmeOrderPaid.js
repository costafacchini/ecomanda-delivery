const PagarMe = require('@plugins/payments/PagarMe')
const Cart = require('@models/Cart')

async function processPagarmeOrderPaid(body) {
  const pagarMe = new PagarMe()
  const event = pagarMe.parser.parseOrderPaidEvent(body)

  const cart = await Cart.findOne({ order_id: event.id })
  if (cart) {
    cart.payment_status = event.payment_status
    cart.integration_status = event.status

    await cart.save()
  } else {
    console.info(`Carrinho não encontrado referente ao pagamento ${event.id} da pagar.me!`)
  }
}

module.exports = processPagarmeOrderPaid
