import sendMessageToMessenger from './SendMessageToMessenger'
import Dialog from '../plugins/messengers/Dialog'
import mongoServer from '.jest/utils'
import { licensee as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { message as messageFactory } from '@factories/message'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { ContactRepositoryDatabase } from '@repositories/contact'
import { MessageRepositoryDatabase } from '@repositories/message'

describe('sendMessageToMessenger', () => {
  const dialogSendMessageSpy = jest.spyOn(Dialog.prototype, 'sendMessage').mockImplementation(() => {})

  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
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

    await sendMessageToMessenger(data)

    expect(dialogSendMessageSpy).toHaveBeenCalledWith(message._id, 'https://www.dialog.com', 'k4d5h8fyt')
  })
})
