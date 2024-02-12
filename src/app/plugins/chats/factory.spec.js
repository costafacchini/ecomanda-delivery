const createChatPlugin = require('./factory')
const Rocketchat = require('./Rocketchat')
const Cuboup = require('./Cuboup')
const Crisp = require('./Crisp')
const { licensee: licenseeFactory } = require('@factories/licensee')

describe('createChatPlugin', () => {
  it('returns the rocketchat plugin if it is configured on licensee', () => {
    const licensee = licenseeFactory.build({ chatDefault: 'rocketchat' })

    const plugin = createChatPlugin(licensee)

    expect(plugin).toBeInstanceOf(Rocketchat)
  })

  it('returns the crisp plugin if it is configured on licensee', () => {
    const licensee = licenseeFactory.build({ chatDefault: 'crisp' })

    const plugin = createChatPlugin(licensee)

    expect(plugin).toBeInstanceOf(Crisp)
  })

  it('returns the cuboup plugin if it is configured on licensee', () => {
    const licensee = licenseeFactory.build({ chatDefault: 'cuboup' })

    const plugin = createChatPlugin(licensee)

    expect(plugin).toBeInstanceOf(Cuboup)
  })

  it('throws if option plugin is unknow', () => {
    const licensee = licenseeFactory.build({ chatDefault: 'something' })

    expect(() => {
      createChatPlugin(licensee)
    }).toThrow('Plugin de chat não configurado: something')
  })
})
