import mongoServer from '../../../.jest/utils.js'
import { createTemplate  } from '@repositories/template.js'
import { licensee as licenseeFactory   } from '@factories/licensee.js'
import { LicenseeRepositoryDatabase  } from '@repositories/licensee.js'

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

    const template = await createTemplate({
      licensee,
      name: 'template',
      namespace: 'Namespace',
    })

    expect(template).toEqual(
      expect.objectContaining({
        licensee,
        name: 'template',
        namespace: 'Namespace',
      }),
    )
  })
})
