const createChatPlugin = require('./factory')
const Licensee = require('@models/Licensee')
const Rocketchat = require('./Rocketchat')
const Jivochat = require('./Jivochat')
const Crisp = require('./Crisp')
const { licensee: licenseeFactory } = require('@factories/licensee')

describe('createChatPlugin', () => {
  it('returns the jivochat plugin if it is configured on licensee', () => {
    const licensee = new Licensee(
      licenseeFactory.build({
        chatDefault: 'jivochat',
      })
    )

    const plugin = createChatPlugin(licensee)

    expect(plugin).toBeInstanceOf(Jivochat)
  })

  it('returns the rocketchat plugin if it is configured on licensee', () => {
    const licensee = new Licensee(
      licenseeFactory.build({
        chatDefault: 'rocketchat',
      })
    )

    const plugin = createChatPlugin(licensee)

    expect(plugin).toBeInstanceOf(Rocketchat)
  })

  it('returns the crisp plugin if it is configured on licensee', () => {
    const licensee = new Licensee(
      licenseeFactory.build({
        chatDefault: 'crisp',
      })
    )

    const plugin = createChatPlugin(licensee)

    expect(plugin).toBeInstanceOf(Crisp)
  })

  it('throws if option plugin is unknow', () => {
    const licensee = new Licensee(
      licenseeFactory.build({
        chatDefault: 'something',
      })
    )

    expect(() => {
      createChatPlugin(licensee)
    }).toThrow('Plugin de chat não configurado: something')
  })
})
