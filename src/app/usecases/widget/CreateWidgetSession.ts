import { v4 as uuidv4 } from 'uuid'

class CreateWidgetSession {
  licenseeRepository: any
  contactRepository: any

  constructor({ licenseeRepository, contactRepository }: Record<string, any> = {}) {
    this.licenseeRepository = licenseeRepository
    this.contactRepository = contactRepository
  }

  async execute({
    apiToken,
    name,
    email,
    phone,
  }: {
    apiToken: string
    name: string
    email: string
    phone?: string
  }): Promise<{ widgetSessionToken: string; contactId: string; licenseeId: string }> {
    const licensee = await this.licenseeRepository.findFirst({ apiToken })
    if (!licensee) throw new Error(`Licensee not found for token: ${apiToken}`)

    let contact = await this.contactRepository.findFirst({
      email,
      type: 'web',
      licensee: licensee._id,
    })

    if (!contact) {
      contact = await this.contactRepository.create({
        number: phone || '00000000000',
        type: 'web',
        name,
        email,
        talkingWithChatBot: false,
        licensee: licensee._id,
        widgetSessionToken: uuidv4(),
      })
    } else if (!contact.widgetSessionToken) {
      contact.widgetSessionToken = uuidv4()
      await this.contactRepository.save(contact)
    }

    return {
      widgetSessionToken: contact.widgetSessionToken,
      contactId: contact._id.toString(),
      licenseeId: licensee._id.toString(),
    }
  }
}

export { CreateWidgetSession }
