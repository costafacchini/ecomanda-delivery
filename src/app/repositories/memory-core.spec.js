import { licensee as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { message as messageFactory } from '@factories/message'
import { triggerText } from '@factories/trigger'
import { LicenseeRepositoryMemory } from './licensee.js'
import { ContactRepositoryMemory } from './contact.js'
import { MessageRepositoryMemory } from './message.js'
import { TriggerRepositoryMemory } from './trigger.js'

jest.mock('uuid', () => ({ v4: () => 'memory-uuid' }))

describe('memory repositories - core entities', () => {
  it('stores and filters licensees in memory', async () => {
    const licenseeRepository = new LicenseeRepositoryMemory()

    const first = await licenseeRepository.create(licenseeFactory.build({ name: 'Company One', chatbotApiToken: null }))
    await licenseeRepository.create(
      licenseeFactory.build({ name: 'Company Two', useChatbot: true, chatbotApiToken: 'chatbot-token' }),
    )

    first.active = false
    await licenseeRepository.save(first)

    expect(await licenseeRepository.findFirst({ _id: first._id })).toEqual(expect.objectContaining({ active: false }))
    expect(await licenseeRepository.find({ useChatbot: true, chatbotApiToken: { $ne: null } })).toHaveLength(1)
  })

  it('finds contacts by normalized number and checks the whatsapp window against shared messages', async () => {
    const messageRepository = new MessageRepositoryMemory()
    const contactRepository = new ContactRepositoryMemory({ messageRepository })
    const licenseeRepository = new LicenseeRepositoryMemory()

    const licensee = await licenseeRepository.create(licenseeFactory.build())
    const contact = await contactRepository.create(contactFactory.build({ licensee, number: '5511990283745' }))

    await messageRepository.create(
      messageFactory.build({
        contact,
        licensee,
        destination: 'to-chat',
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
      }),
    )

    expect(await contactRepository.getContactByNumber('11990283745', licensee._id)).toEqual(
      expect.objectContaining({ _id: contact._id }),
    )
    expect(await contactRepository.contactWithWhatsappWindowClosed(contact._id)).toEqual(true)
  })

  it('creates interactive messages using shared trigger storage', async () => {
    const triggerRepository = new TriggerRepositoryMemory()
    const messageRepository = new MessageRepositoryMemory({ triggerRepository })
    const licenseeRepository = new LicenseeRepositoryMemory()
    const contactRepository = new ContactRepositoryMemory()

    const licensee = await licenseeRepository.create(licenseeFactory.build())
    const contact = await contactRepository.create(contactFactory.build({ licensee }))

    const secondTrigger = await triggerRepository.create(
      triggerText.build({ licensee, expression: 'hello_world', text: 'Second', order: 2 }),
    )
    const firstTrigger = await triggerRepository.create(
      triggerText.build({ licensee, expression: 'hello_world', text: 'First', order: 1 }),
    )

    const messages = await messageRepository.createInteractiveMessages({
      destination: 'to-chatbot',
      kind: 'text',
      text: 'hello_world',
      contact,
      licensee,
    })

    expect(messages).toHaveLength(2)
    expect(messages[0]).toEqual(expect.objectContaining({ number: 'memory-uuid', trigger: firstTrigger._id }))
    expect(messages[1]).toEqual(expect.objectContaining({ number: 'memory-uuid', trigger: secondTrigger._id }))
  })
})
