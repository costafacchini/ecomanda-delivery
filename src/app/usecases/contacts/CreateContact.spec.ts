import { contact as contactFactory } from '@factories/contact'
import { ContactRepositoryMemory } from '@repositories/contact'
import { CreateContact } from './CreateContact'

describe('CreateContact', () => {
  it('creates a contact with permitted fields', async () => {
    const contactRepository = new ContactRepositoryMemory()
    const createContact = new CreateContact({ contactRepository })

    const contact = await createContact.execute({
      ...contactFactory.build({
        name: 'John Doe',
        number: '5511990283745',
        type: '@c.us',
        licensee: 'licensee-id',
        waId: '12345',
        landbotId: '56477',
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
      }),
    )
    expect(contact.ignoredField).toBeUndefined()
  })
})
