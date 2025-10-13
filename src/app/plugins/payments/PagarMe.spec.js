import { PagarMe } from './PagarMe.js'
import { Recipient } from './PagarMe/Recipient.js'
import { Customer } from './PagarMe/Customer.js'
import { Payment } from './PagarMe/Payment.js'
import { Card } from './PagarMe/Card.js'
import { licenseeIntegrationPagarMe as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { cart as cartFactory } from '@factories/cart'

describe('PagarMe plugin', () => {
  const recipientCreateFnSpy = jest.spyOn(Recipient.prototype, 'create').mockImplementation(() => {})
  const recipientUpdateFnSpy = jest.spyOn(Recipient.prototype, 'update').mockImplementation(() => {})

  const customerCreateFnSpy = jest.spyOn(Customer.prototype, 'create').mockImplementation(() => {})
  const customerUpdateFnSpy = jest.spyOn(Customer.prototype, 'update').mockImplementation(() => {})

  const paymentPixCreateFnSpy = jest.spyOn(Payment.prototype, 'createPIX').mockImplementation(() => {})
  const paymentCreditCardCreateFnSpy = jest.spyOn(Payment.prototype, 'createCreditCard').mockImplementation(() => {})
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
    it('createPIX', async () => {
      const cart = cartFactory.build()

      const pagarMe = new PagarMe()
      await pagarMe.payment.createPIX(cart, 'token')

      expect(paymentPixCreateFnSpy).toHaveBeenCalledWith(cart, 'token')
    })

    it('createCreditCard', async () => {
      const cart = cartFactory.build()

      const pagarMe = new PagarMe()
      await pagarMe.payment.createCreditCard(cart, 'token')

      expect(paymentCreditCardCreateFnSpy).toHaveBeenCalledWith(cart, 'token')
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
