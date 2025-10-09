import sendContactToPagarMe from './SendContactToPagarMe.js'
import Customer from '@plugins/payments/PagarMe/Customer.js'
import mongoServer from '.jest/utils.js'
import { licensee as licenseeFactory   } from '@factories/licensee.js'
import { contact as contactFactory   } from '@factories/contact.js'
import { LicenseeRepositoryDatabase  } from '@repositories/licensee.js'
import { ContactRepositoryDatabase  } from '@repositories/contact.js'

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
