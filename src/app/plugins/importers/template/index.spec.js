const Template = require('@models/Template')
const Dialog = require('@plugins/messengers/Dialog')
const TemplatesImporter = require('@plugins/importers/template/index')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { template: templateFactory } = require('@factories/template')
const mongoServer = require('../../../../../.jest/utils')
const { LicenseeRepositoryDatabase } = require('@repositories/licensee')

describe('TemplatesImporter', () => {
  beforeAll(async () => {
    await mongoServer.connect()
  })

  afterAll(async () => {
    await mongoServer.disconnect()
  })

  it('imports the templates of whatsapp', async () => {
    const licenseeRepository = new LicenseeRepositoryDatabase()
    const licensee = await licenseeRepository.create(
      licenseeFactory.build({ whatsappDefault: 'dialog', whatsappUrl: 'https://dialog.com', whatsappToken: 'token' }),
    )
    const template = await Template.create(templateFactory.build({ licensee }))

    jest.spyOn(Dialog.prototype, 'searchTemplates').mockImplementation(() => {
      return [
        {
          name: 'sample_movie_ticket_confirmation',
          namespace: '93aa6bf3_3bfc_4840_a76c_0f43073739e2',
          licensee: licensee,
          language: 'en',
          active: true,
          cagtegory: 'TICKET_UPDATE',
        },
        {
          name: 'sample_movie_ticket',
          namespace: '93aa6bf3_3bfc_4840_a76c_0f43073739e2',
          licensee: licensee,
          language: 'en',
          active: true,
          cagtegory: 'TICKET_UPDATE',
        },
      ]
    })

    const templatesImporter = new TemplatesImporter(licensee._id)
    await templatesImporter.import()

    const oldTemplate = await Template.findById(template._id)
    expect(oldTemplate).toEqual(null)
    expect(await Template.where({ licensee }).countDocuments()).toEqual(2)
  })
})
