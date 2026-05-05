import { contact as contactFactory } from '@factories/contact'
import { ContactRepositoryMemory } from '@repositories/contact'
import { CreateContact, SEND_CONTACT_TO_PAGARME_JOB } from './CreateContact.js'

describe('CreateContact', () => {
  it('creates a contact with permitted fields and enqueues the pagarme sync job', async () => {
    const contactRepository = new ContactRepositoryMemory()
    const jobQueue = {
      addJob: jest.fn().mockResolvedValue(undefined),
    }
    const createContact = new CreateContact({ contactRepository, jobQueue })

    const contact = await createContact.execute({
      ...contactFactory.build({
        name: 'John Doe',
        number: '5511990283745',
        type: '@c.us',
        licensee: 'licensee-id',
        waId: '12345',
        landbotId: '56477',
        plugin_cart_id: 123,
      }),
      ignoredField: 'ignored',
    })

    expect(contact).toEqual(
      expect.objectContaining({
        name: 'John Doe',
        number: '5511990283745',
        type: '@c.us',
        licensee: 'licensee-id',
        waId: '12345',
        landbotId: '56477',
        plugin_cart_id: '123',
      }),
    )
    expect(contact.ignoredField).toBeUndefined()
    expect(jobQueue.addJob).toHaveBeenCalledWith(SEND_CONTACT_TO_PAGARME_JOB, {
      contactId: contact._id.toString(),
    })
  })
})
