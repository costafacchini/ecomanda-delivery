import { licenseeComplete as licenseeCompleteFactory } from '@factories/licensee'
import { LicenseeRepositoryMemory } from '@repositories/licensee'
import { CreateLicensee } from './CreateLicensee.js'

describe('CreateLicensee', () => {
  it('creates a licensee with the mapped fields and parsed pedidos10 integration', async () => {
    const licenseeRepository = new LicenseeRepositoryMemory()
    const createLicensee = new CreateLicensee({ licenseeRepository })

    const licensee = await createLicensee.execute({
      ...licenseeCompleteFactory.build(),
      pedidos10_integration: '{"store":"123"}',
      ignoredField: 'ignored',
    })

    expect(licensee).toEqual(
      expect.objectContaining({
        name: 'Alcateia Ltds',
        email: 'alcateia@alcateia.com',
        whatsappDefault: 'dialog',
        whatsappUrl: 'https://waba.360dialog.io/',
        pedidos10_integration: { store: '123' },
      }),
    )
    expect(licensee.ignoredField).toBeUndefined()
  })
})
