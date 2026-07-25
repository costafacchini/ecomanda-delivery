const WHATSAPP_DEFAULT_BAILEYS = 'baileys'
const NOT_BAILEYS_MESSAGE = 'Inbox não usa Baileys'

class SyncBaileysDirectoryForInbox {
  inboxRepository: any
  licenseeRepository: any
  contactRepository: any
  createMessengerPlugin: any

  constructor({
    inboxRepository,
    licenseeRepository,
    contactRepository,
    createMessengerPlugin,
  }: Record<string, any> = {}) {
    this.inboxRepository = inboxRepository
    this.licenseeRepository = licenseeRepository
    this.contactRepository = contactRepository
    this.createMessengerPlugin = createMessengerPlugin
  }

  async execute(inboxId: any) {
    const inbox = await this.inboxRepository.findFirst({ _id: inboxId })
    if (!inbox) {
      return { message: 'Inbox não encontrado' }
    }

    const licensee = await this.licenseeRepository.findFirst({ _id: inbox.licensee })
    if (!licensee || inbox.whatsappDefault !== WHATSAPP_DEFAULT_BAILEYS) {
      return { message: NOT_BAILEYS_MESSAGE }
    }

    const plugin = this.createMessengerPlugin(licensee, { inbox })

    await this.contactRepository.deactivateGroupsForLicensee(licensee._id)

    const { groups } = await plugin.fetchGroups()

    let importedGroups = 0
    let updatedGroups = 0
    const importedContacts = 0
    const updatedContacts = 0
    const skipped = 0

    for (const group of groups) {
      const { waId, name, number, type } = group

      let existing = null

      if (waId) {
        existing = await this.contactRepository.findFirst({ licensee: licensee._id, waId })
      }

      if (!existing) {
        existing = await this.contactRepository.findFirst({ licensee: licensee._id, number, type })
      }

      const payload = {
        name,
        number,
        type,
        waId,
        talkingWithChatBot: false,
        licensee: licensee._id,
        isGroup: true,
        active: true,
      }

      if (existing) {
        await this.contactRepository.update(existing._id, payload)
        updatedGroups += 1
      } else {
        await this.contactRepository.create(payload)
        importedGroups += 1
      }
    }

    return { importedContacts, updatedContacts, importedGroups, updatedGroups, skipped }
  }
}

export { SyncBaileysDirectoryForInbox, NOT_BAILEYS_MESSAGE }
