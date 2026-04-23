import request from '../../../services/request.js'
import { IntegrationlogRepositoryDatabase } from '../../../repositories/integrationlog.js'
import { ContactRepositoryDatabase } from '../../../repositories/contact.js'

class Card {
  constructor({
    integrationlogRepository = new IntegrationlogRepositoryDatabase(),
    contactRepository = new ContactRepositoryDatabase(),
  } = {}) {
    this.integrationlogRepository = integrationlogRepository
    this.contactRepository = contactRepository
  }

  async create(contact, creditCard, token) {
    const body = {
      number: creditCard.number,
      holder_name: creditCard.holder_name,
      exp_month: creditCard.expiration_month,
      exp_year: creditCard.expiration_year,
      cvv: creditCard.cvv,
    }

    const headers = {
      Authorization: `Basic ${token}`,
    }
    const response = await request.post(`https://api.pagar.me/core/v5/customers/${contact.customer_id}/cards`, {
      headers,
      body,
    })
    const integrationlog = await this.integrationlogRepository.create({
      licensee: contact.licensee,
      contact: contact._id,
      log_payload: response.data,
    })
    if (response.status === 200) {
      contact.credit_card_id = response.data.id
      await this.contactRepository.save(contact)

      console.info(
        `Cartão ${creditCard.number.substr(0, 6)}******${creditCard.number.substr(-4)} ${
          creditCard.holder_name
        } criado na pagar.me! id: ${contact.credit_card_id} log_id: ${integrationlog._id}`,
      )

      return { success: true }
    } else {
      const error = `Cartão ${creditCard.number.substr(0, 6)}******${creditCard.number.substr(-4)} ${
        creditCard.holder_name
      } não criado na pagar.me.
           status: ${response.status}
           mensagem: ${JSON.stringify(response.data)}
           log_id: ${integrationlog._id}`

      console.error(error)

      return {
        success: false,
        error,
      }
    }
  }

  async list(contact, token) {
    const headers = {
      Authorization: `Basic ${token}`,
    }
    const response = await request.get(`https://api.pagar.me/core/v5/customers/${contact.customer_id}/cards`, {
      headers,
    })

    if (response.status === 200) {
      return response.data.data
    } else {
      const integrationlog = await this.integrationlogRepository.create({
        licensee: contact.licensee,
        contact: contact._id,
        log_payload: response.data,
      })

      console.error(
        `Não foi possível buscar os cartões na pagar.me.
           status: ${response.status}
           mensagem: ${JSON.stringify(response.data)}
           log_id: ${integrationlog._id}`,
      )
    }
  }

  async getById(contact, token) {
    const headers = {
      Authorization: `Basic ${token}`,
    }
    const response = await request.get(
      `https://api.pagar.me/core/v5/customers/${contact.customer_id}/cards/${contact.credit_card_id}`,
      {
        headers,
      },
    )

    if (response.status === 200) {
      return response.data
    } else {
      const integrationlog = await this.integrationlogRepository.create({
        licensee: contact.licensee,
        contact: contact._id,
        log_payload: response.data,
      })

      console.error(
        `Não foi possível buscar os cartões na pagar.me.
           status: ${response.status}
           mensagem: ${JSON.stringify(response.data)}
           log_id: ${integrationlog._id}`,
      )
    }
  }
}

export { Card }
