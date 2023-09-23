const PagarMe = require('./PagarMe')
const Recipient = require('./PagarMe/Recipient')
const Customer = require('./PagarMe/Customer')
const Payment = require('./PagarMe/Payment')
const Card = require('./PagarMe/Card')
const { licenseeIntegrationPagarMe: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')
const { cart: cartFactory } = require('@factories/cart')

describe('PagarMe plugin', () => {
  const recipientCreateFnSpy = jest.spyOn(Recipient.prototype, 'create').mockImplementation(() => {})
  const recipientUpdateFnSpy = jest.spyOn(Recipient.prototype, 'update').mockImplementation(() => {})

  const customerCreateFnSpy = jest.spyOn(Customer.prototype, 'create').mockImplementation(() => {})
  const customerUpdateFnSpy = jest.spyOn(Customer.prototype, 'update').mockImplementation(() => {})

  const paymentCreateFnSpy = jest.spyOn(Payment.prototype, 'create').mockImplementation(() => {})
  const paymentDeleteFnSpy = jest.spyOn(Payment.prototype, 'delete').mockImplementation(() => {})

  const cardCreateFnSpy = jest.spyOn(Card.prototype, 'create').mockImplementation(() => {})
  const cardListFnSpy = jest.spyOn(Card.prototype, 'list').mockImplementation(() => {})
  const cardGetByIdFnSpy = jest.spyOn(Card.prototype, 'getById').mockImplementation(() => {})

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

  describe('customer', () => {
    it('create', async () => {
      const contact = contactFactory.build()

      const pagarMe = new PagarMe()
      await pagarMe.customer.create(contact, 'token')

      expect(customerCreateFnSpy).toHaveBeenCalledWith(contact, 'token')
    })

    it('update', async () => {
      const contact = contactFactory.build()

      const pagarMe = new PagarMe()
      await pagarMe.customer.update(contact, 'token')

      expect(customerUpdateFnSpy).toHaveBeenCalledWith(contact, 'token')
    })
  })

  describe('payment', () => {
    it('create', async () => {
      const cart = cartFactory.build()

      const pagarMe = new PagarMe()
      await pagarMe.payment.create(cart, 'token')

      expect(paymentCreateFnSpy).toHaveBeenCalledWith(cart, 'token')
    })

    it('delete', async () => {
      const cart = cartFactory.build()

      const pagarMe = new PagarMe()
      await pagarMe.payment.delete(cart, 'token')

      expect(paymentDeleteFnSpy).toHaveBeenCalledWith(cart, 'token')
    })
  })

  describe('parser', () => {
    it('parseOrderPaidEvent', () => {
      const pagarMe = new PagarMe()
      const event = pagarMe.parser.parseOrderPaidEvent({})

      expect(event).toEqual(expect.objectContaining({ id: '' }))
    })
  })

  describe('card', () => {
    it('create', async () => {
      const contact = contactFactory.build()
      const cardData = {
        number: '1234123412341234',
        cvv: '123',
      }

      const pagarMe = new PagarMe()
      await pagarMe.card.create(contact, cardData, 'token')

      expect(cardCreateFnSpy).toHaveBeenCalledWith(contact, cardData, 'token')
    })

    it('list', async () => {
      const contact = contactFactory.build()

      const pagarMe = new PagarMe()
      await pagarMe.card.list(contact, 'token')

      expect(cardListFnSpy).toHaveBeenCalledWith(contact, 'token')
    })

    it('getById', async () => {
      const contact = contactFactory.build()

      const pagarMe = new PagarMe()
      await pagarMe.card.getById(contact, 'token')

      expect(cardGetByIdFnSpy).toHaveBeenCalledWith(contact, 'token')
    })
  })
})
