import { licenseePedidos10 as licenseePedidos10Factory } from '@factories/licensee'
import { LicenseeRepositoryMemory } from '@repositories/licensee'
import { UpdateLicensee } from './UpdateLicensee.js'

describe('UpdateLicensee', () => {
  it('updates a licensee with permitted fields and returns the normalized record', async () => {
    const licenseeRepository = new LicenseeRepositoryMemory()
    const updateLicensee = new UpdateLicensee({ licenseeRepository })
    const licensee = await licenseeRepository.create(licenseePedidos10Factory.build())

    const updatedLicensee = await updateLicensee.execute(licensee._id, {
      _id: 'ignored',
      name: 'Name modified',
      whatsappDefault: 'utalk',
      pedidos10_integration: '{"integration_token":"next-token"}',
    })

    expect(updatedLicensee).toEqual(
      expect.objectContaining({
        _id: licensee._id,
        name: 'Name modified',
        whatsappDefault: 'utalk',
        pedidos10_integration: '{"integration_token":"next-token"}',
      }),
    )

    const storedLicensee = await licenseeRepository.findFirst({ _id: licensee._id })
    expect(storedLicensee.pedidos10_integration).toEqual({ integration_token: 'next-token' })
  })
})
