import { licenseeComplete as licenseeCompleteFactory } from '@factories/licensee'
import { LicenseeRepositoryMemory } from '@repositories/licensee'
import { CreateLicensee } from './CreateLicensee'

describe('CreateLicensee', () => {
  it('creates a licensee with the mapped fields and ignores unknown fields', async () => {
    const licenseeRepository = new LicenseeRepositoryMemory()
    const createLicensee = new CreateLicensee({ licenseeRepository })

    const licensee = await createLicensee.execute({
      ...licenseeCompleteFactory.build(),
      ignoredField: 'ignored',
    })

    expect(licensee).toEqual(
      expect.objectContaining({
        name: 'Alcateia Ltds',
        email: 'alcateia@alcateia.com',
        whatsappDefault: 'dialog',
        whatsappUrl: 'https://waba.360dialog.io/',
      }),
    )
    expect(licensee.ignoredField).toBeUndefined()
  })
})
