import { licenseeComplete as licenseeCompleteFactory } from '@factories/licensee'
import { LicenseeRepositoryMemory } from '@repositories/licensee'
import { LICENSEE_SENT_TO_PAGARME_MESSAGE, SendLicenseeToPagarMe } from './SendLicenseeToPagarMe.js'

describe('SendLicenseeToPagarMe', () => {
  it('creates a recipient when the licensee does not have a pagar.me recipient yet', async () => {
    const licenseeRepository = new LicenseeRepositoryMemory()
    const pagarMe = {
      recipient: {
        create: jest.fn(),
        update: jest.fn(),
      },
    }
    const createPagarMe = jest.fn().mockReturnValue(pagarMe)
    const sendLicenseeToPagarMe = new SendLicenseeToPagarMe({
      licenseeRepository,
      createPagarMe,
      pagarMeToken: 'token',
    })
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build())

    const response = await sendLicenseeToPagarMe.execute(licensee._id)

    expect(createPagarMe).toHaveBeenCalled()
    expect(pagarMe.recipient.create).toHaveBeenCalledWith(licensee, 'token')
    expect(pagarMe.recipient.update).not.toHaveBeenCalled()
    expect(response).toEqual({ message: LICENSEE_SENT_TO_PAGARME_MESSAGE })
  })

  it('updates the recipient when the licensee already has a pagar.me recipient id', async () => {
    const licenseeRepository = new LicenseeRepositoryMemory()
    const pagarMe = {
      recipient: {
        create: jest.fn(),
        update: jest.fn(),
      },
    }
    const createPagarMe = jest.fn().mockReturnValue(pagarMe)
    const sendLicenseeToPagarMe = new SendLicenseeToPagarMe({
      licenseeRepository,
      createPagarMe,
      pagarMeToken: 'token',
    })
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ recipient_id: 'recipient-123' }))

    const response = await sendLicenseeToPagarMe.execute(licensee._id)

    expect(pagarMe.recipient.update).toHaveBeenCalledWith(licensee, 'token')
    expect(pagarMe.recipient.create).not.toHaveBeenCalled()
    expect(response).toEqual({ message: LICENSEE_SENT_TO_PAGARME_MESSAGE })
  })
})
