import Integrationlog from '../../../models/Integrationlog.js'
import request from '../../../services/request.js'
import { logger } from '../../../../setup/logger.js'

class Recipient {
  async create(licensee, token) {
    const body = {
      name: licensee.name,
      email: licensee.email,
      document: licensee.document,
      type: licensee.kind,
      default_bank_account: {
        holder_name: licensee.holder_name,
        bank: licensee.bank,
        branch_number: licensee.branch_number,
        branch_check_digit: licensee.branch_check_digit,
        account_number: licensee.account_number,
        account_check_digit: licensee.account_check_digit,
        holder_type: licensee.holder_kind,
        holder_document: licensee.holder_document,
        type: licensee.account_type,
      },
    }

    const headers = {
      Authorization: `Basic ${token}`,
    }

    const response = await request.post('https://api.pagar.me/core/v5/recipients/', { headers, body })

    const integrationlog = await Integrationlog.create({
      licensee: licensee,
      log_payload: response.data,
    })

    if (response.status === 200) {
      licensee.recipient_id = response.data.id
      await licensee.save()

      logger.info(
        `Licenciado ${licensee.name} criado na pagar.me! id: ${licensee.recipient_id} log_id: ${integrationlog._id}`,
      )
    } else {
      logger.error(
        `Licenciado ${licensee.name} não criado na pagar.me.
           status: ${response.status}
           log_id: ${integrationlog._id}`,
        response.data,
      )
    }
  }
  async update(licensee, token) {
    const body = {
      email: licensee.email,
      type: licensee.kind,
    }

    const headers = {
      Authorization: `Basic ${token}`,
    }

    const response = await request.put(`https://api.pagar.me/core/v5/recipients/${licensee.recipient_id}`, {
      headers,
      body,
    })

    const integrationlog = await Integrationlog.create({
      licensee: licensee,
      log_payload: response.data,
    })

    if (response.status === 200) {
      logger.info(
        `Licenciado ${licensee.name} atualizado na pagar.me! id: ${licensee.recipient_id} log_id: ${integrationlog._id}`,
      )
    } else {
      logger.error(
        `Licenciado ${licensee.name} não atualizado na pagar.me.
           status: ${response.status}
           log_id: ${integrationlog._id}`,
        response.data,
      )
    }
  }
}

export { Recipient }
