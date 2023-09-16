const Licensee = require('@models/Licensee')
const Contact = require('@models/Contact')
const Integrationlog = require('@models/Integrationlog')
const request = require('../../../services/request')

class Payment {
  async create(cart, token) {
    const licensee = await Licensee.findById(cart.licensee._id)
    const contact = await Contact.findById(cart.contact._id)

    const body = {
      customer_id: contact.customer_id,
      items: [],
      shipping: {
        amount: Math.floor(cart.delivery_tax * 100),
        recipient_name: contact.name,
        recipient_phone: contact.number,
        address: {
          country: 'BR',
          state: cart.uf,
          city: cart.city,
          zip_code: cart.cep,
          line_1: `${cart.address_number}, ${cart.address}, ${cart.neighborhood}`,
          line_2: cart.address_complement,
        },
      },
      payments: [
        {
          payment_method: 'pix',
          amount: Math.floor(cart.total * 100),
          pix: {
            expires_in: 1800,
            split: [
              {
                amount: Math.floor(cart.total * (100 - licensee.financial_player_fee)),
                recipient_id: licensee.recipient_id,
                type: 'flat',
              },
            ],
          },
        },
      ],
    }

    for (const product of cart.products) {
      body.items.push({
        amount: Math.floor(product.unit_price * 100),
        description: product.name,
        quantity: product.quantity,
        code: product.product_retailer_id,
      })
    }

    const headers = {
      Authorization: `Basic ${token}`,
    }

    const response = await request.post('https://api.pagar.me/core/v5/orders/', { headers, body })

    const integrationlog = await Integrationlog.create({
      licensee: cart.licensee,
      cart: cart._id,
      log_payload: response.data,
    })

    if (response.status === 200) {
      cart.order_id = response.data.id
      cart.charge_id = response.data.charges[0].id
      cart.pix_qrcode = response.data.charges[0].last_transaction.qr_code
      cart.pix_url = response.data.charges[0].last_transaction.qr_code_url
      cart.payment_status = response.data.charges[0].last_transaction.status
      cart.integration_status = response.data.status
      await cart.save()

      console.info(`Pedido criado na pagar.me! id: ${cart.order_id} log_id: ${integrationlog._id}`)
    } else {
      console.error(
        `Pedido ${cart._id} não criado na pagar.me.
           status: ${response.status}
           mensagem: ${JSON.stringify(response.data)}
           log_id: ${integrationlog._id}`,
      )
    }
  }

  async delete(cart, token) {
    const headers = {
      Authorization: `Basic ${token}`,
    }

    const response = await request.delete(`https://api.pagar.me/core/v5/charges/${cart.charge_id}`, { headers })

    const integrationlog = await Integrationlog.create({
      licensee: cart.licensee,
      cart: cart._id,
      log_payload: response.data,
    })

    if (response.status === 200) {
      cart.payment_status = 'voided'
      cart.concluded = true
      await cart.save()

      console.info(`Pagamento cancelado na pagar.me! id: ${cart.charge_id} log_id: ${integrationlog._id}`)
    } else {
      console.error(
        `Pagamento ${cart._id} não cancelado na pagar.me.
           status: ${response.status}
           mensagem: ${JSON.stringify(response.data)}
           log_id: ${integrationlog._id}`,
      )
    }
  }
}

module.exports = Payment
