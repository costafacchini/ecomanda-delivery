import { triggerMultiProduct as triggerMultiProductFactory } from '@factories/trigger'
import { TriggerRepositoryMemory } from '@repositories/trigger'
import { UpdateTrigger } from './UpdateTrigger'

describe('UpdateTrigger', () => {
  it('updates a trigger with permitted fields and preserves licensee', async () => {
    const triggerRepository = new TriggerRepositoryMemory()
    const updateTrigger = new UpdateTrigger({ triggerRepository })
    const trigger = await triggerRepository.create(
      triggerMultiProductFactory.build({
        licensee: 'original-licensee-id',
        catalogId: 'catalog-id',
      }),
    )

    const updatedTrigger = await updateTrigger.execute(trigger._id, {
      _id: 'ignored',
      name: 'Another',
      triggerKind: 'single_product',
      expression: 'single',
      catalogSingle: 'single catalog',
      catalogId: 'next-catalog-id',
      licensee: 'new-licensee-id',
    })

    expect(updatedTrigger).toEqual(
      expect.objectContaining({
        _id: trigger._id,
        name: 'Another',
        triggerKind: 'single_product',
        expression: 'single',
        catalogSingle: 'single catalog',
        catalogId: 'next-catalog-id',
        licensee: 'original-licensee-id',
      }),
    )

    const storedTrigger = await triggerRepository.findFirst({ _id: trigger._id })
    expect(storedTrigger.licensee).toEqual('original-licensee-id')
  })
})
