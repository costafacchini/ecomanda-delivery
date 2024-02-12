const createChatbotPlugin = require('./factory')
const Landbot = require('./Landbot')
const { licensee: licenseeFactory } = require('@factories/licensee')

describe('createChatbotPlugin', () => {
  it('returns the landbot plugin if it is configured on licensee', () => {
    const licensee = licenseeFactory.build({ chatbotDefault: 'landbot' })

    const plugin = createChatbotPlugin(licensee)

    expect(plugin).toBeInstanceOf(Landbot)
  })

  it('throws if option plugin is unknow', () => {
    const licensee = licenseeFactory.build({ chatbotDefault: 'something' })

    expect(() => {
      createChatbotPlugin(licensee)
    }).toThrow('Plugin de chatbot não configurado: something')
  })
})
