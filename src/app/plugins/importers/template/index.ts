class TemplatesImporter {
  licenseeId: any
  licenseeRepository: any
  templateRepository: any
  createMessengerPlugin: any

  constructor(
    licenseeId: any,
    {
      licenseeRepository,
      templateRepository,
      createMessengerPlugin,
    }: { licenseeRepository?: any; templateRepository?: any; createMessengerPlugin?: any } = {},
  ) {
    this.licenseeId = licenseeId
    this.licenseeRepository = licenseeRepository
    this.templateRepository = templateRepository
    this.createMessengerPlugin = createMessengerPlugin
  }

  async import() {
    const licensee = await this.licenseeRepository.findFirst({ _id: this.licenseeId })

    await this.templateRepository.delete({})

    if (!licensee) return

    if (!['dialog', 'ycloud', 'pabbly'].includes(licensee.whatsappDefault)) {
      return
    }

    const messengerPlugin = this.createMessengerPlugin(licensee)
    const templates = await messengerPlugin.searchTemplates(licensee.whatsappUrl, licensee.whatsappToken)

    for (const template of templates) {
      await this.templateRepository.create(template)
    }
  }
}

export { TemplatesImporter }
