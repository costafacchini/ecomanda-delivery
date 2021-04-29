const createChatPlugin = require('./factory')
const Licensee = require('@models/licensee')
const Rocketchat = require('./rocketchat')
const Jivochat = require('./jivochat')

describe('createChatPlugin', () => {
  it('returns the jivochat plugin if it is configured on licensee', () => {
    const licensee = new Licensee({
      chatDefault: 'jivochat'
    })

    const body = {
      message: 'test'
    }

    const plugin = createChatPlugin(licensee, body)

    expect(plugin).toBeInstanceOf(Jivochat)
  })

  it('returns the rocketchat plugin if it is configured on licensee', () => {
    const licensee = new Licensee({
      chatDefault: 'rocketchat'
    })

    const body = {
      type: 'test'
    }

    const plugin = createChatPlugin(licensee, body)

    expect(plugin).toBeInstanceOf(Rocketchat)
  })

  it('throws if option plugin is unknow', () => {
    const licensee = new Licensee({
      chatDefault: 'something'
    })

    const body = {
      field: 'test'
    }

    expect(() => {
      createChatPlugin(licensee, body)
    }).toThrow('Plugin de chat não configurado: something')
  })
})