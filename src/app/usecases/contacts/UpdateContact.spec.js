import { contact as contactFactory } from '@factories/contact'
import { ContactRepositoryMemory } from '@repositories/contact'
import { UpdateContact, SEND_CONTACT_TO_PAGARME_JOB } from './UpdateContact.js'

describe('UpdateContact', () => {
  it('updates a contact without changing licensee and enqueues the pagarme sync job', async () => {
    const contactRepository = new ContactRepositoryMemory()
    const jobQueue = {
      addJob: jest.fn().mockResolvedValue(undefined),
    }
    const updateContact = new UpdateContact({ contactRepository, jobQueue })
    const contact = await contactRepository.create(
      contactFactory.build({
        name: 'John Doe',
        number: '5511990283745',
        type: '@c.us',
        licensee: 'original-licensee-id',
        waId: '12345',
        landbotId: '56477',
      }),
    )

    const updatedContact = await updateContact.execute(contact._id, {
      _id: 'ignored',
      name: 'John Silva',
      number: '55998465654',
      type: '@g.us',
      talkingWithChatBot: true,
      licensee: 'new-licensee-id',
      waId: '54321',
      landbotId: '9876',
      plugin_cart_id: 456,
    })

    expect(updatedContact).toEqual(
      expect.objectContaining({
        _id: contact._id,
        name: 'John Silva',
        number: '55998465654',
        type: '@g.us',
        talkingWithChatBot: true,
        licensee: 'original-licensee-id',
        waId: '54321',
        landbotId: '9876',
        plugin_cart_id: 456,
      }),
    )
    expect(jobQueue.addJob).toHaveBeenCalledWith(SEND_CONTACT_TO_PAGARME_JOB, {
      contactId: contact._id.toString(),
    })

    const storedContact = await contactRepository.findFirst({ _id: contact._id })
    expect(storedContact.licensee).toEqual('original-licensee-id')
  })
})
