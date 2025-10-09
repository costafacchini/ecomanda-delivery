import Integrationlog from '@models/Integrationlog.js'
import request from '../../../services/request.js'
import { LicenseeRepositoryDatabase  } from '@repositories/licensee.js'
import { ContactRepositoryDatabase  } from '@repositories/contact.js'

const buildBody = (cart, contact, buildPaymentBuilder) => {
  return {
    customer_id: contact.customer_id,
    items: cart.products.map((product) => buildItem(product)),
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
    payments: buildPaymentBuilder.build(),
  }
}

const buildItem = (product) => {
  return {
    amount: Math.floor(product.unit_price * 100),
    description: product.name,
    quantity: product.quantity,
    code: product.product_retailer_id,
  }
}

const buildPaymentPIX = (licensee, cart) => {
  return [
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
  ]
}

const buildPaymentCreditCard = (licensee, cart, contact) => {
  return [
    {
      payment_method: 'credit_card',
      amount: Math.floor(cart.total * 100),
      credit_card: {
        recurrence: 'false',
        installments: 1,
        statement_descriptor: licensee.name,
        operation_type: 'auth_and_capture',
        card_id: contact.credit_card_id,
      },
    },
  ]
}

const doRequest = async (token, body) => {
  const headers = {
    Authorization: `Basic ${token}`,
  }

  const response = await request.post('https://api.pagar.me/core/v5/orders/', { headers, body })

  return response
}

const fillPixFields = (cart, last_transaction) => {
  cart.pix_qrcode = last_transaction.qr_code
  cart.pix_url = last_transaction.qr_code_url
}

const fillCreditCardFields = (cart, last_transaction) => {
  cart.operation_key = last_transaction.operation_key
  cart.operation_id = last_transaction.id
  cart.gateway_id = last_transaction.gateway_id
  cart.gateway_response_code = last_transaction.gateway_response.code
}

class Payment {
  async createPIX(cart, token) {
    const licenseeRepository = new LicenseeRepositoryDatabase()
    const licensee = await licenseeRepository.findFirst({ _id: cart.licensee._id })

    const contactRepository = new ContactRepositoryDatabase()
    const contact = await contactRepository.findFirst(cart.contact._id)

    const paymentBuilder = {
      build() {
        return buildPaymentPIX(licensee, cart)
      },
    }
    const body = buildBody(cart, contact, paymentBuilder)

    const response = await doRequest(token, body)

    const integrationlog = await Integrationlog.create({
      licensee: cart.licensee,
      cart: cart._id,
      log_payload: response.data,
    })

    if (response.status === 200) {
      cart.order_id = response.data.id
      cart.charge_id = response.data.charges[0].id
      cart.payment_status = response.data.charges[0].last_transaction.status
      cart.integration_status = response.data.status
      fillPixFields(cart, response.data.charges[0].last_transaction)

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

  async createCreditCard(cart, token) {
    const licenseeRepository = new LicenseeRepositoryDatabase()
    const licensee = await licenseeRepository.findFirst({ _id: cart.licensee._id })

    const contactRepository = new ContactRepositoryDatabase()
    const contact = await contactRepository.findFirst(cart.contact._id)

    const paymentBuilder = {
      build() {
        return buildPaymentCreditCard(licensee, cart, contact)
      },
    }
    const body = buildBody(cart, contact, paymentBuilder)

    const response = await doRequest(token, body)

    const integrationlog = await Integrationlog.create({
      licensee: cart.licensee,
      cart: cart._id,
      log_payload: response.data,
    })

    if (response.status === 200) {
      cart.order_id = response.data.id
      cart.charge_id = response.data.charges[0].id
      cart.payment_status = response.data.charges[0].last_transaction.status
      cart.integration_status = response.data.status
      fillCreditCardFields(cart, response.data.charges[0].last_transaction)

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

export default Payment
