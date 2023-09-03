const PagarMe = require('./PagarMe')
const Recipient = require('./PagarMe/Recipient')
const { licenseeIntegrationPagarMe: licenseeFactory } = require('@factories/licensee')

describe('PagarMe plugin', () => {
  const recipientCreateFnSpy = jest.spyOn(Recipient.prototype, 'create').mockImplementation(() => {})
  const recipientUpdateFnSpy = jest.spyOn(Recipient.prototype, 'update').mockImplementation(() => {})

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('recipient', () => {
    it('create', async () => {
      const licensee = licenseeFactory.build()

      const pagarMe = new PagarMe()
      await pagarMe.recipient.create(licensee, 'token')

      expect(recipientCreateFnSpy).toHaveBeenCalledWith(licensee, 'token')
    })

    it('update', async () => {
      const licensee = licenseeFactory.build()

      const pagarMe = new PagarMe()
      await pagarMe.recipient.update(licensee, 'token')

      expect(recipientUpdateFnSpy).toHaveBeenCalledWith(licensee, 'token')
    })
  })
})
