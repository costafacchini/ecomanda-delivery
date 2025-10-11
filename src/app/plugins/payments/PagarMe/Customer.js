import Integrationlog from '@models/Integrationlog'
import request from '../../../services/request'

class Customer {
  async create(contact, token) {
    const body = {
      name: contact.name,
      email: contact.email,
      phones: {
        mobile_phone: {
          country_code: contact.number.substring(0, 2),
          area_code: contact.number.substring(2, 4),
          number: contact.number.substring(4),
        },
      },
    }

    if (contact.address) {
      body.address = {
        country: 'BR',
        state: contact.uf,
        city: contact.city,
        zip_code: contact.cep,
        line_1: `${contact.address_number}, ${contact.address}, ${contact.neighborhood}`,
        line_2: contact.address_complement,
      }
    }

    const headers = {
      Authorization: `Basic ${token}`,
    }

    const response = await request.post('https://api.pagar.me/core/v5/customers/', { headers, body })

    const integrationlog = await Integrationlog.create({
      licensee: contact.licensee,
      contact: contact._id,
      log_payload: response.data,
    })

    if (response.status === 200) {
      contact.customer_id = response.data.id
      if (contact.address) contact.address_id = response.data.address.id
      await contact.save()

      console.info(
        `Contato ${contact.name} criado na pagar.me! id: ${contact.customer_id} log_id: ${integrationlog._id}`,
      )
    } else {
      console.error(
        `Contato ${contact.name} não criado na pagar.me.
           status: ${response.status}
           mensagem: ${JSON.stringify(response.data)}
           log_id: ${integrationlog._id}`,
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

    const integrationlog = await Integrationlog.create({
      licensee: contact.licensee,
      contact: contact._id,
      log_payload: response.data,
    })

    if (response.status === 200) {
      console.info(
        `Contato ${contact.name} atualizado na pagar.me! id: ${contact.customer_id} log_id: ${integrationlog._id}`,
      )
    } else {
      console.error(
        `Contato ${contact.name} não atualizado na pagar.me.
           status: ${response.status}
           mensagem: ${JSON.stringify(response.data)}
           log_id: ${integrationlog._id}`,
      )
    }
  }
}

export default Customer
