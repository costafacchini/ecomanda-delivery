import mongoServer from '../../../.jest/utils'
import { createTemplate } from '@repositories/template'
import { licensee as licenseeFactory } from '@factories/licensee'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { TemplateRepositoryDatabase } from '@repositories/template'

describe('#createTemplate', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('creates a template', async () => {
    const licenseeRepository = new LicenseeRepositoryDatabase()
    const licensee = await licenseeRepository.create(licenseeFactory.build())
    const templateRepository = new TemplateRepositoryDatabase()

    const template = await createTemplate(
      {
        licensee,
        name: 'template',
        namespace: 'Namespace',
      },
      {
        templateRepository,
      },
    )

    expect(template).toEqual(
      expect.objectContaining({
        licensee,
        name: 'template',
        namespace: 'Namespace',
      }),
    )
  })
})
