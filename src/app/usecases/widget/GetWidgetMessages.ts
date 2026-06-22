class GetWidgetMessages {
  licenseeRepository: any
  contactRepository: any
  roomRepository: any
  messageRepository: any

  constructor({ licenseeRepository, contactRepository, roomRepository, messageRepository }: Record<string, any> = {}) {
    this.licenseeRepository = licenseeRepository
    this.contactRepository = contactRepository
    this.roomRepository = roomRepository
    this.messageRepository = messageRepository
  }

  async execute({
    apiToken,
    widgetSessionToken,
    since,
  }: {
    apiToken: string
    widgetSessionToken: string
    since?: Date
  }) {
    const licensee = await this.licenseeRepository.findFirst({ apiToken })
    if (!licensee) throw new Error(`Licensee not found for token: ${apiToken}`)

    const contact = await this.contactRepository.findFirst({ widgetSessionToken, licensee: licensee._id })
    if (!contact) throw new Error(`Widget session not found: ${widgetSessionToken}`)

    const room = await this.roomRepository.findOpenForContact(contact._id)
    if (!room) return []

    return await this.messageRepository.findByRoom(room._id, { since })
  }
}

export { GetWidgetMessages }
