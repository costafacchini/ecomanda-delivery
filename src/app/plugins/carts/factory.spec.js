import { createCartPlugin } from './factory.js'
import { Go2go } from './Go2go.js'
import { Go2goV2 } from './Go2goV2.js'
import { Alloy } from './Alloy.js'
import { licensee as licenseeFactory } from '@factories/licensee'

describe('createCartPlugin', () => {
  it('returns the go2go plugin if it is configured on licensee', () => {
    const licensee = licenseeFactory.build({ cartDefault: 'go2go' })

    const plugin = createCartPlugin(licensee)

    expect(plugin).toBeInstanceOf(Go2go)
  })

  it('returns the go2go v2 plugin if it is configured on licensee', () => {
    const licensee = licenseeFactory.build({ cartDefault: 'go2go_v2' })

    const plugin = createCartPlugin(licensee)

    expect(plugin).toBeInstanceOf(Go2goV2)
  })

  it('returns the alloy plugin if it is configured on licensee', () => {
    const licensee = licenseeFactory.build({ cartDefault: 'alloy' })

    const plugin = createCartPlugin(licensee)

    expect(plugin).toBeInstanceOf(Alloy)
  })

  it('throws if option plugin is unknow', () => {
    const licensee = licenseeFactory.build({ cartDefault: 'something' })

    expect(() => {
      createCartPlugin(licensee)
    }).toThrow('Plugin de cart não configurado: something')
  })
})
