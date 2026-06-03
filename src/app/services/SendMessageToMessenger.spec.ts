import { sendMessageToMessenger } from './SendMessageToMessenger'
import { Dialog } from '../plugins/messengers/Dialog'
import { installMemoryRepositories, resetMemoryRepositories } from '@repositories/testing'
import { licensee as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { message as messageFactory } from '@factories/message'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { ContactRepositoryDatabase } from '@repositories/contact'
import { MessageRepositoryDatabase } from '@repositories/message'
import { createRuntimeDependencies } from '../runtime/dependencies'

let dependencies

describe('sendMessageToMessenger', () => {
  const dialogSendMessageSpy = jest.spyOn(Dialog.prototype, 'sendMessage').mockImplementation(() => {})

  beforeEach(() => {
    installMemoryRepositories()
    dependencies = createRuntimeDependencies()
    jest.clearAllMocks()
  })

  afterEach(() => {
    resetMemoryRepositories()
  })

  it('asks the plugin to send message to messenger', async () => {
    const licenseeRepository = new LicenseeRepositoryDatabase()
    const licensee = await licenseeRepository.create(
      licenseeFactory.build({
        whatsappDefault: 'dialog',
        whatsappUrl: 'https://chat.url',
        whatsappToken: 'token',
      }),
    )

    const contactRepository = new ContactRepositoryDatabase()
    const contact = await contactRepository.create(
      contactFactory.build({
        licensee,
      }),
    )

    const messageRepository = new MessageRepositoryDatabase()
    const message = await messageRepository.create(
      messageFactory.build({
        contact,
        licensee,
      }),
    )

    const data = {
      messageId: message._id,
      url: 'https://www.dialog.com',
      token: 'k4d5h8fyt',
    }

    await sendMessageToMessenger(data, dependencies)

    expect(dialogSendMessageSpy).toHaveBeenCalledWith(message._id, 'https://www.dialog.com', 'k4d5h8fyt')
  })

  it('falls back to licensee whatsappUrl and whatsappToken when url and token are absent from data', async () => {
    const licenseeRepository = new LicenseeRepositoryDatabase()
    // dialog normalizes whatsappUrl to 'https://waba.360dialog.io/' on save
    const licensee = await licenseeRepository.create(
      licenseeFactory.build({
        whatsappDefault: 'dialog',
        whatsappToken: 'licensee-token',
      }),
    )

    const contactRepository = new ContactRepositoryDatabase()
    const contact = await contactRepository.create(contactFactory.build({ licensee }))

    const messageRepository = new MessageRepositoryDatabase()
    const message = await messageRepository.create(messageFactory.build({ contact, licensee }))

    await sendMessageToMessenger({ messageId: message._id }, dependencies)

    expect(dialogSendMessageSpy).toHaveBeenCalledWith(message._id, 'https://waba.360dialog.io/', 'licensee-token')
  })
})
