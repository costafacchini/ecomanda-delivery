const transformChatbotBody = require('./ChatbotMessage')
const Licensee = require('@models/Licensee')
const Body = require('@models/Body')
const Landbot = require('../plugins/chatbots/Landbot')
const mongoServer = require('.jest/utils')

describe('transformChatbotBody', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('responds with action to send message to messenger', async () => {
    const chatbotPluginResponseToMessages = jest
      .spyOn(Landbot.prototype, 'responseToMessages')
      .mockImplementation(() => {
        return [{ _id: 'KSDF656DSD91NSE' }, { _id: 'OAR8Q54LDN02T' }]
      })

    const licensee = await Licensee.create({
      licenseKind: 'demo',
      name: 'Alcatéia',
      chatbotDefault: 'landbot',
      whatsappDefault: 'chatapi',
      whatsappUrl: 'https://chat.url',
      whatsappToken: 'token',
    })

    const body = await Body.create({
      content: {
        message: 'text',
      },
      licensee: licensee._id,
    })

    const data = {
      bodyId: body._id,
    }

    const actions = await transformChatbotBody(data)

    expect(chatbotPluginResponseToMessages).toHaveBeenCalledWith(body.content)

    expect(actions[0].action).toEqual('send-message-to-messenger')
    expect(actions[0].body).toEqual({ messageId: 'KSDF656DSD91NSE', url: 'https://chat.url', token: 'token' })

    expect(actions[1].action).toEqual('send-message-to-messenger')
    expect(actions[1].body).toEqual({ messageId: 'OAR8Q54LDN02T', url: 'https://chat.url', token: 'token' })

    expect(actions.length).toEqual(2)
  })

  it('responds with blank actions if body is invalid', async () => {
    const chatbotPluginResponseToMessages = jest
      .spyOn(Landbot.prototype, 'responseToMessages')
      .mockImplementation(() => {
        return []
      })

    const licensee = await Licensee.create({
      licenseKind: 'demo',
      name: 'Alcatéia',
      chatbotDefault: 'landbot',
      whatsappDefault: 'chatapi',
      whatsappUrl: 'https://chat.url',
      whatsappToken: 'token',
    })

    const body = await Body.create({
      content: {
        is: 'invalid',
      },
      licensee: licensee._id,
    })

    const data = {
      bodyId: body._id,
    }

    const actions = await transformChatbotBody(data)

    expect(chatbotPluginResponseToMessages).toHaveBeenCalledWith(body.content)

    expect(actions.length).toEqual(0)
  })
})
