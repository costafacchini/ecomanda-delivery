const createChatPlugin = require('./factory')
const Licensee = require('@models/Licensee')
const Rocketchat = require('./Rocketchat')
const Jivochat = require('./Jivochat')

describe('createChatPlugin', () => {
  it('returns the jivochat plugin if it is configured on licensee', () => {
    const licensee = new Licensee({
      chatDefault: 'jivochat',
    })

    const plugin = createChatPlugin(licensee)

    expect(plugin).toBeInstanceOf(Jivochat)
  })

  it('returns the rocketchat plugin if it is configured on licensee', () => {
    const licensee = new Licensee({
      chatDefault: 'rocketchat',
    })

    const plugin = createChatPlugin(licensee)

    expect(plugin).toBeInstanceOf(Rocketchat)
  })

  it('throws if option plugin is unknow', () => {
    const licensee = new Licensee({
      chatDefault: 'something',
    })

    expect(() => {
      createChatPlugin(licensee)
    }).toThrow('Plugin de chat não configurado: something')
  })
})
