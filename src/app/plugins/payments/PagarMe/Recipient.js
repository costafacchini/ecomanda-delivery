const request = require('../../../services/request')

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
      transfer_settings: {
        enabled: false,
      },
      automatic_anticipation_settings: {
        enabled: false,
      },
    }

    const headers = {
      Authorization: `Basic ${token}`,
    }

    const response = await request.post('https://api.pagar.me/core/v5/recipients/', { headers, body })

    if (response.status === 200) {
      licensee.recipient_id = response.data.id
      await licensee.save()

      console.info(`Licenciado ${licensee.name} criado na pagar.me! ${JSON.stringify(response.data)}`)
    } else {
      console.error(
        `Licenciado ${licensee.name} não criado na pagar.me.
           status: ${response.status}
           mensagem: ${JSON.stringify(response.data)}`
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

    const response = await request.patch(`https://api.pagar.me/core/v5/recipients/${licensee.recipient_id}`, {
      headers,
      body,
    })

    if (response.status === 200) {
      console.info(`Licenciado ${licensee.name} atualizado na pagar.me! ${JSON.stringify(response.data)}`)
    } else {
      console.error(
        `Licenciado ${licensee.name} não atualizado na pagar.me.
           status: ${response.status}
           mensagem: ${JSON.stringify(response.data)}`
      )
    }
  }
}

module.exports = Recipient
