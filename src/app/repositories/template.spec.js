const Licensee = require('@models/Licensee')
const mongoServer = require('../../../.jest/utils')
const { createTemplate } = require('@repositories/template')
const { licensee: licenseeFactory } = require('@factories/licensee')

describe('#createTemplate', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('creates a template', async () => {
    const licensee = await Licensee.create(licenseeFactory.build())

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
