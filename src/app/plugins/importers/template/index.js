const Licensee = require('@models/Licensee')
const Dialog = require('@plugins/messengers/Dialog')
const { createTemplate, destroyAllTemplates } = require('@repositories/template')

class TemplatesImporter {
  constructor(licenseeId) {
    this.licenseeId = licenseeId
  }

  async import() {
    const licensee = await Licensee.findById(this.licenseeId)
    await destroyAllTemplates()
    if (licensee.whatsappDefault === 'dialog') {
      const dialog = new Dialog(licensee)
      const templates = await dialog.searchTemplates(licensee.whatsappUrl, licensee.whatsappToken)
      templates.forEach((template) => createTemplate(template))
    }
  }
}

module.exports = TemplatesImporter
