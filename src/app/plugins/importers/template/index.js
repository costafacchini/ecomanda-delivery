import { Dialog } from '../../messengers/Dialog.js'
import { YCloud } from '../../messengers/YCloud.js'
import { createTemplate, destroyAllTemplates } from '../../../repositories/template.js'
import { LicenseeRepositoryDatabase } from '../../../repositories/licensee.js'

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

    if (licensee.whatsappDefault === 'ycloud') {
      const chatwoot = new YCloud(licensee)
      const templates = await chatwoot.searchTemplates(licensee.whatsappUrl, licensee.whatsappToken)
      templates.forEach((template) => createTemplate(template))
    }
  }
}

export { TemplatesImporter }
