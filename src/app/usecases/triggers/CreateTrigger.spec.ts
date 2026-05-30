import { triggerMultiProduct as triggerMultiProductFactory } from '@factories/trigger'
import { TriggerRepositoryMemory } from '@repositories/trigger'
import { CreateTrigger } from './CreateTrigger'

describe('CreateTrigger', () => {
  it('creates a trigger with permitted fields only', async () => {
    const triggerRepository = new TriggerRepositoryMemory()
    const createTrigger = new CreateTrigger({ triggerRepository })

    const trigger = await createTrigger.execute({
      ...triggerMultiProductFactory.build({
        licensee: 'licensee-id',
        catalogId: 'catalog-id',
      }),
      ignoredField: 'ignored',
    })

    expect(trigger).toEqual(
      expect.objectContaining({
        name: 'Send multi products',
        triggerKind: 'multi_product',
        expression: 'send_multi_product',
        catalogMulti: 'catalog',
        catalogId: 'catalog-id',
        licensee: 'licensee-id',
      }),
    )
    expect(trigger.ignoredField).toBeUndefined()
  })
})
