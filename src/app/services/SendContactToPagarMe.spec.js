const sendContactToPagarMe = require('./SendContactToPagarMe')
const Customer = require('@plugins/payments/PagarMe/Customer')
const Licensee = require('@models/Licensee')
const Contact = require('@models/Contact')
const mongoServer = require('.jest/utils')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')

describe('sendContactToPagarMe', () => {
  const customerCreateFnSpy = jest.spyOn(Customer.prototype, 'create').mockImplementation(() => {})
  const customerUpdateFnSpy = jest.spyOn(Customer.prototype, 'update').mockImplementation(() => {})

  beforeEach(async () => {
    jest.clearAllMocks()
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('does nothing if licensee has no recipient_id', async () => {
    const licensee = await Licensee.create(licenseeFactory.build({ recipient_id: null }))

    const contact = await Contact.create(contactFactory.build({ licensee }))

    const data = { contactId: contact._id.toString() }

    await sendContactToPagarMe(data)

    expect(customerCreateFnSpy).not.toHaveBeenCalled()
    expect(customerUpdateFnSpy).not.toHaveBeenCalled()
  })

  it('creates a customer on pagar.me API', async () => {
    const licensee = await Licensee.create(licenseeFactory.build({ recipient_id: '1234' }))

    const contact = await Contact.create(contactFactory.build({ licensee }))

    const data = { contactId: contact._id.toString() }

    await sendContactToPagarMe(data)

    expect(customerCreateFnSpy).toHaveBeenCalled()
    expect(customerUpdateFnSpy).not.toHaveBeenCalled()
  })

  it('updates a customer on pagar.me API if contact has customer_id', async () => {
    const licensee = await Licensee.create(licenseeFactory.build({ recipient_id: '1234' }))

    const contact = await Contact.create(contactFactory.build({ customer_id: '1234', licensee }))

    const data = { contactId: contact._id.toString() }

    await sendContactToPagarMe(data)

    expect(customerCreateFnSpy).not.toHaveBeenCalled()
    expect(customerUpdateFnSpy).toHaveBeenCalled()
  })
})
