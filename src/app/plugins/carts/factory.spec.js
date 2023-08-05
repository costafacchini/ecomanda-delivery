const createCartPlugin = require('./factory')
const Licensee = require('@models/Licensee')
const Go2go = require('./Go2go')
const Go2goV2 = require('./Go2goV2')
const Alloy = require('./Alloy')
const { licensee: licenseeFactory } = require('@factories/licensee')

describe('createCartPlugin', () => {
  it('returns the go2go plugin if it is configured on licensee', () => {
    const licensee = new Licensee(
      licenseeFactory.build({
        cartDefault: 'go2go',
      })
    )

    const plugin = createCartPlugin(licensee)

    expect(plugin).toBeInstanceOf(Go2go)
  })

  it('returns the go2go v2 plugin if it is configured on licensee', () => {
    const licensee = new Licensee(
      licenseeFactory.build({
        cartDefault: 'go2go_v2',
      })
    )

    const plugin = createCartPlugin(licensee)

    expect(plugin).toBeInstanceOf(Go2goV2)
  })

  it('returns the alloy plugin if it is configured on licensee', () => {
    const licensee = new Licensee(
      licenseeFactory.build({
        cartDefault: 'alloy',
      })
    )

    const plugin = createCartPlugin(licensee)

    expect(plugin).toBeInstanceOf(Alloy)
  })

  it('throws if option plugin is unknow', () => {
    const licensee = new Licensee(
      licenseeFactory.build({
        cartDefault: 'something',
      })
    )

    expect(() => {
      createCartPlugin(licensee)
    }).toThrow('Plugin de cart não configurado: something')
  })
})
