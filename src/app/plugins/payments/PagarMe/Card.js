import Integrationlog from '../../../models/Integrationlog.js'
import request from '../../../services/request.js'
import { logger } from '../../../../setup/logger.js'

class Card {
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
    const integrationlog = await Integrationlog.create({
      licensee: contact.licensee,
      contact: contact._id,
      log_payload: response.data,
    })
    if (response.status === 200) {
      contact.credit_card_id = response.data.id
      await contact.save()

      logger.info(
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
           log_id: ${integrationlog._id}`

      logger.error(error, response.data)

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
      const integrationlog = await Integrationlog.create({
        licensee: contact.licensee,
        contact: contact._id,
        log_payload: response.data,
      })

      logger.error(
        `Não foi possível buscar os cartões na pagar.me.
           status: ${response.status}
           log_id: ${integrationlog._id}`,
        response.data,
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
      const integrationlog = await Integrationlog.create({
        licensee: contact.licensee,
        contact: contact._id,
        log_payload: response.data,
      })

      logger.error(
        `Não foi possível buscar os cartões na pagar.me.
           status: ${response.status}
           log_id: ${integrationlog._id}`,
        response.data,
      )
    }
  }
}

export { Card }
