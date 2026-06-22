import { LocalChat } from '../../plugins/chats/LocalChat'

class SendWidgetMessage {
  licenseeRepository: any
  contactRepository: any
  messageRepository: any
  roomRepository: any

  constructor({ licenseeRepository, contactRepository, messageRepository, roomRepository }: Record<string, any> = {}) {
    this.licenseeRepository = licenseeRepository
    this.contactRepository = contactRepository
    this.messageRepository = messageRepository
    this.roomRepository = roomRepository
  }

  async execute({ apiToken, widgetSessionToken, text }: { apiToken: string; widgetSessionToken: string; text: string }) {
    const licensee = await this.licenseeRepository.findFirst({ apiToken })
    if (!licensee) throw new Error(`Licensee not found for token: ${apiToken}`)

    const contact = await this.contactRepository.findFirst({ widgetSessionToken, licensee: licensee._id })
    if (!contact) throw new Error(`Widget session not found: ${widgetSessionToken}`)

    const message = await this.messageRepository.create({
      licensee: licensee._id,
      contact: contact._id,
      destination: 'to-chat',
      kind: 'text',
      text,
    })

    const localChat = new LocalChat(licensee, {
      roomRepository: this.roomRepository,
      messageRepository: this.messageRepository,
    })
    await localChat.sendMessage(message._id)

    return message
  }
}

export { SendWidgetMessage }
