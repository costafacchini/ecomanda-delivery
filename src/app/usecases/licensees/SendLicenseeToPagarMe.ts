const LICENSEE_SENT_TO_PAGARME_MESSAGE = 'Licenciado enviado para a pagar.me!'

class SendLicenseeToPagarMe {
  licenseeRepository: any
  createPagarMe: any
  pagarMeToken: any

  constructor({ licenseeRepository, createPagarMe, pagarMeToken }: Record<string, any> = {}) {
    this.licenseeRepository = licenseeRepository
    this.createPagarMe = createPagarMe
    this.pagarMeToken = pagarMeToken
  }

  async execute(id) {
    const licensee = await this.licenseeRepository.findFirst({ _id: id })
    const pagarMe = this.createPagarMe()

    if (licensee.recipient_id) {
      await pagarMe.recipient.update(licensee, this.pagarMeToken)
    } else {
      await pagarMe.recipient.create(licensee, this.pagarMeToken)
    }

    return { message: LICENSEE_SENT_TO_PAGARME_MESSAGE }
  }
}

export { SendLicenseeToPagarMe, LICENSEE_SENT_TO_PAGARME_MESSAGE }
