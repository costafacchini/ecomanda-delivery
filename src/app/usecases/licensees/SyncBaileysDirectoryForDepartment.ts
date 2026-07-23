const WHATSAPP_DEFAULT_BAILEYS = 'baileys'
const NOT_BAILEYS_MESSAGE = 'Licensee não usa Baileys'

class SyncBaileysDirectoryForDepartment {
  departmentRepository: any
  licenseeRepository: any
  contactRepository: any
  createMessengerPlugin: any
  syncBaileysDirectoryForInbox: any

  constructor({
    departmentRepository,
    licenseeRepository,
    contactRepository,
    createMessengerPlugin,
    syncBaileysDirectoryForInbox,
  }: Record<string, any> = {}) {
    this.departmentRepository = departmentRepository
    this.licenseeRepository = licenseeRepository
    this.contactRepository = contactRepository
    this.createMessengerPlugin = createMessengerPlugin
    this.syncBaileysDirectoryForInbox = syncBaileysDirectoryForInbox
  }

  async execute(departmentId: any) {
    const department = await this.departmentRepository.findFirst({ _id: departmentId })
    if (!department) {
      return { message: 'Departamento não encontrado' }
    }

    if (department.inbox) {
      return this.syncBaileysDirectoryForInbox.execute(department.inbox)
    }

    const licensee = await this.licenseeRepository.findFirst({ _id: department.licensee })
    if (!licensee || licensee.whatsappDefault !== WHATSAPP_DEFAULT_BAILEYS) {
      return { message: NOT_BAILEYS_MESSAGE }
    }

    const plugin = this.createMessengerPlugin(licensee, { department })

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

export { SyncBaileysDirectoryForDepartment, NOT_BAILEYS_MESSAGE }
