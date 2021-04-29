const createChatbotPlugin = require('./factory')
const Licensee = require('@models/licensee')
const Landbot = require('./landbot')

describe('createChatbotPlugin', () => {
  it('returns the landbot plugin if it is configured on licensee', () => {
    const licensee = new Licensee({
      chatbotDefault: 'landbot',
    })

    const body = {
      field: 'test'
    }

    const plugin = createChatbotPlugin('option', licensee, body)

    expect(plugin).toBeInstanceOf(Landbot)
  })

  it('throws if option plugin is unknow', () => {
    const licensee = new Licensee({
      chatbotDefault: 'something'
    })

    const body = {
      field: 'test'
    }

    expect(() => {
      createChatbotPlugin('option', licensee, body)
    }).toThrow('Plugin de chatbot não configurado: something')
  })
})