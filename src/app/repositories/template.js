const Template = require('@models/Template')

async function destroyAllTemplates() {
  await Template.deleteMany()
}

async function createTemplate(fields) {
  const template = new Template({ ...fields })

  const templateSaved = await template.save()

  return templateSaved
}

module.exports = { createTemplate, destroyAllTemplates }
