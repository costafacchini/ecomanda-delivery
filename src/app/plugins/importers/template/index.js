const Dialog = require('@plugins/messengers/Dialog')
const { createTemplate, destroyAllTemplates } = require('@repositories/template')
const { LicenseeRepositoryDatabase } = require('@repositories/licensee')

class TemplatesImporter {
  constructor(licenseeId) {
    this.licenseeId = licenseeId
  }

  async import() {
    const licenseeRepository = new LicenseeRepositoryDatabase()
    const licensee = await licenseeRepository.findFirst({ _id: this.licenseeId })

    await destroyAllTemplates()

    if (licensee.whatsappDefault === 'dialog') {
      const dialog = new Dialog(licensee)
      const templates = await dialog.searchTemplates(licensee.whatsappUrl, licensee.whatsappToken)
      templates.forEach((template) => createTemplate(template))
    }
  }
}

module.exports = TemplatesImporter
