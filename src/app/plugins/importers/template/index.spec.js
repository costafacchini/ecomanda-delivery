import Template from '@models/Template.js'
import Dialog from '@plugins/messengers/Dialog.js'
import TemplatesImporter from '@plugins/importers/template/index.js'
import { licensee as licenseeFactory   } from '@factories/licensee.js'
import { template as templateFactory   } from '@factories/template.js'
import mongoServer from '../../../../../.jest/utils.js'
import { LicenseeRepositoryDatabase  } from '@repositories/licensee.js'

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
