const transformChatbotTransferBody = require('./ChatbotTransfer')
const Licensee = require('@models/Licensee')
const Body = require('@models/Body')
const Landbot = require('../plugins/chatbots/Landbot')
const mongoServer = require('.jest/utils')

describe('transformChatbotTransferBody', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('responds with action to transfer message to chat and marks body to concluded', async () => {
    const chatbotPluginResponseToMessages = jest
      .spyOn(Landbot.prototype, 'responseTransferToMessage')
      .mockImplementation(() => {
        return { _id: 'KSDF656DSD91NSE' }
      })

    const licensee = await Licensee.create({
      licenseKind: 'demo',
      name: 'Alcatéia',
      chatbotDefault: 'landbot',
      chatUrl: 'https://chat.url',
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

    const actions = await transformChatbotTransferBody(data)

    expect(chatbotPluginResponseToMessages).toHaveBeenCalledWith(body.content)

    const bodyUpdated = await Body.findById(body._id)
    expect(body.concluded).toEqual(false)
    expect(bodyUpdated.concluded).toEqual(true)

    expect(actions[0].action).toEqual('transfer-to-chat')
    expect(actions[0].body).toEqual({ messageId: 'KSDF656DSD91NSE', url: 'https://chat.url' })

    expect(actions.length).toEqual(1)
  })

  it('responds with blank actions if body is invalid and marks body to concluded', async () => {
    const chatbotPluginResponseToMessages = jest
      .spyOn(Landbot.prototype, 'responseTransferToMessage')
      .mockImplementation(() => {
        return null
      })

    const licensee = await Licensee.create({
      licenseKind: 'demo',
      name: 'Alcatéia',
      chatbotDefault: 'landbot',
      chatUrl: 'https://chat.url',
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

    const actions = await transformChatbotTransferBody(data)

    expect(chatbotPluginResponseToMessages).toHaveBeenCalledWith(body.content)

    const bodyUpdated = await Body.findById(body._id)
    expect(body.concluded).toEqual(false)
    expect(bodyUpdated.concluded).toEqual(true)

    expect(actions.length).toEqual(0)
  })
})
