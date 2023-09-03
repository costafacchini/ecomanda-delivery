const request = require('../../../services/request')

class Customer {
  async create(contact, token) {
    const body = {
      name: contact.name,
      email: contact.email,
      address: {
        country: 'BR',
        state: contact.uf,
        city: contact.city,
        zip_code: contact.cep,
        line_1: `${contact.address_number}, ${contact.address}, ${contact.neighborhood}`,
        line_2: contact.address_complement,
      },
      phones: {
        mobile_phone: {
          country_code: contact.number.substring(0, 2),
          area_code: contact.number.substring(2, 4),
          number: contact.number.substring(4),
        },
      },
    }

    const headers = {
      Authorization: `Basic ${token}`,
    }

    const response = await request.post('https://api.pagar.me/core/v5/customers/', { headers, body })

    if (response.status === 200) {
      contact.customer_id = response.data.id
      contact.address_id = response.data.address.id
      await contact.save()

      console.info(`Contato ${contact.name} criado na pagar.me! ${JSON.stringify(response.data)}`)
    } else {
      console.error(
        `Contato ${contact.name} não criado na pagar.me.
           status: ${response.status}
           mensagem: ${JSON.stringify(response.data)}`
      )
    }
  }
  async update(contact, token) {
    const body = {
      name: contact.name,
      email: contact.email,
    }

    const headers = {
      Authorization: `Basic ${token}`,
    }

    const response = await request.put(`https://api.pagar.me/core/v5/customers/${contact.customer_id}`, {
      headers,
      body,
    })

    if (response.status === 200) {
      console.info(`Contato ${contact.name} atualizado na pagar.me! ${JSON.stringify(response.data)}`)
    } else {
      console.error(
        `Contato ${contact.name} não atualizado na pagar.me.
           status: ${response.status}
           mensagem: ${JSON.stringify(response.data)}`
      )
    }
  }
}

module.exports = Customer
