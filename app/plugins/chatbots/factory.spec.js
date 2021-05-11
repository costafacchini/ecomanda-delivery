const createChatbotPlugin = require('./factory')
const Licensee = require('@models/Licensee')
const Landbot = require('./Landbot')

describe('createChatbotPlugin', () => {
  it('returns the landbot plugin if it is configured on licensee', () => {
    const licensee = new Licensee({
      chatbotDefault: 'landbot',
    })

    const plugin = createChatbotPlugin(licensee)

    expect(plugin).toBeInstanceOf(Landbot)
  })

  it('throws if option plugin is unknow', () => {
    const licensee = new Licensee({
      chatbotDefault: 'something',
    })

    expect(() => {
      createChatbotPlugin(licensee)
    }).toThrow('Plugin de chatbot não configurado: something')
  })
})
