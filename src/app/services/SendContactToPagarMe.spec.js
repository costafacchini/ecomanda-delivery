const sendContactToPagarMe = require('./SendContactToPagarMe')
const Customer = require('@plugins/payments/PagarMe/Customer')
const mongoServer = require('.jest/utils')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')
const { LicenseeRepositoryDatabase } = require('@repositories/licensee')
const { ContactRepositoryDatabase } = require('@repositories/contact')

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
    const licenseeRepository = new LicenseeRepositoryDatabase()
    const licensee = await licenseeRepository.create(licenseeFactory.build({ recipient_id: null }))

    const contactRepository = new ContactRepositoryDatabase()
    const contact = await contactRepository.create(contactFactory.build({ licensee }))

    const data = { contactId: contact._id.toString() }

    await sendContactToPagarMe(data)

    expect(customerCreateFnSpy).not.toHaveBeenCalled()
    expect(customerUpdateFnSpy).not.toHaveBeenCalled()
  })

  it('creates a customer on pagar.me API', async () => {
    const licenseeRepository = new LicenseeRepositoryDatabase()
    const licensee = await licenseeRepository.create(licenseeFactory.build({ recipient_id: '1234' }))

    const contactRepository = new ContactRepositoryDatabase()
    const contact = await contactRepository.create(contactFactory.build({ licensee }))

    const data = { contactId: contact._id.toString() }

    await sendContactToPagarMe(data)

    expect(customerCreateFnSpy).toHaveBeenCalled()
    expect(customerUpdateFnSpy).not.toHaveBeenCalled()
  })

  it('updates a customer on pagar.me API if contact has customer_id', async () => {
    const licenseeRepository = new LicenseeRepositoryDatabase()
    const licensee = await licenseeRepository.create(licenseeFactory.build({ recipient_id: '1234' }))

    const contactRepository = new ContactRepositoryDatabase()
    const contact = await contactRepository.create(contactFactory.build({ customer_id: '1234', licensee }))

    const data = { contactId: contact._id.toString() }

    await sendContactToPagarMe(data)

    expect(customerCreateFnSpy).not.toHaveBeenCalled()
    expect(customerUpdateFnSpy).toHaveBeenCalled()
  })
})
