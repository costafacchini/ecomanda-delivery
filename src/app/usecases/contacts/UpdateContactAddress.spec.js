import { ContactRepositoryMemory } from '@repositories/contact'
import { NormalizePhone } from '../../helpers/NormalizePhone'
import { UpdateContactAddress } from './UpdateContactAddress.js'

function buildUseCase() {
  const contactRepository = new ContactRepositoryMemory()
  const updateContactAddress = new UpdateContactAddress({
    contactRepository,
    normalizePhone: (number) => new NormalizePhone(number),
  })
  return { updateContactAddress, contactRepository }
}

describe('UpdateContactAddress', () => {
  it('updates permitted address fields and returns the updated contact', async () => {
    const { updateContactAddress, contactRepository } = buildUseCase()
    await contactRepository.create({ number: '5511990283745', type: '@c.us', licensee: 'licensee-id' })

    const result = await updateContactAddress.execute({
      number: '11990283745',
      licenseeId: 'licensee-id',
      fields: {
        address: 'Rua dois de outubro',
        address_number: '123',
        address_complement: 'rooms 1 and 2',
        neighborhood: 'Pedra branca',
        city: 'São Paulo',
        cep: '98543287',
        uf: 'SP',
        delivery_tax: 10.39,
        licensee: 'should-be-ignored',
      },
    })

    expect(result.address).toBe('Rua dois de outubro')
    expect(result.address_number).toBe('123')
    expect(result.delivery_tax).toBe(10.39)
    expect(result.licensee).toBe('licensee-id')
  })

  it('returns null when contact is not found', async () => {
    const { updateContactAddress } = buildUseCase()

    const result = await updateContactAddress.execute({
      number: '11111111111',
      licenseeId: 'licensee-id',
      fields: { address: 'Some street' },
    })

    expect(result).toBeNull()
  })

  it('returns null when contact belongs to a different licensee', async () => {
    const { updateContactAddress, contactRepository } = buildUseCase()
    await contactRepository.create({ number: '5511990283745', type: '@c.us', licensee: 'other-licensee' })

    const result = await updateContactAddress.execute({
      number: '11990283745',
      licenseeId: 'licensee-id',
      fields: { address: 'Some street' },
    })

    expect(result).toBeNull()
  })
})
