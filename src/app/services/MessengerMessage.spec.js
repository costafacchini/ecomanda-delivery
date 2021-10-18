const transformMessengerBody = require('./MessengerMessage')
const Licensee = require('@models/Licensee')
const Body = require('@models/Body')
const Chatapi = require('../plugins/messengers/Chatapi')
const mongoServer = require('.jest/utils')

describe('transformMessengerBody', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('responds with action to send message to chat and chatbot and delete body', async () => {
    const messengerPluginResponseToMessages = jest
      .spyOn(Chatapi.prototype, 'responseToMessages')
      .mockImplementation(() => {
        return [
          { _id: 'KSDF656DSD91NSE', destination: 'to-chatbot' },
          { _id: 'OAR8Q54LDN02T', destination: 'to-chat' },
        ]
      })

    const licensee = await Licensee.create({
      licenseKind: 'demo',
      name: 'Alcatéia',
      whatsappDefault: 'chatapi',
      whatsappUrl: 'https://whatsapp.com',
      whatsappToken: 'bshg25f',
      chatbotUrl: 'https://whatsapp.url',
      chatbotAuthorizationToken: 'ljsdf12g',
      chatUrl: 'https://chat.url',
    })

    const body = await Body.create({
      content: {
        message: {
          type: 'message',
        },
      },
      licensee: licensee._id,
    })

    const data = {
      bodyId: body._id,
    }

    const actions = await transformMessengerBody(data)

    expect(messengerPluginResponseToMessages).toHaveBeenCalledWith(body.content)

    const bodyDeleted = await Body.findById(body._id)
    expect(bodyDeleted).toEqual(null)

    expect(actions[0].action).toEqual('send-message-to-chatbot')
    expect(actions[0].body).toEqual({ messageId: 'KSDF656DSD91NSE', url: 'https://whatsapp.url', token: 'ljsdf12g' })

    expect(actions[1].action).toEqual('send-message-to-chat')
    expect(actions[1].body).toEqual({ messageId: 'OAR8Q54LDN02T', url: 'https://chat.url', token: '' })

    expect(actions.length).toEqual(2)
  })

  it('responds with blank actions if body is invalid and delete body', async () => {
    const messengerPluginResponseToMessages = jest
      .spyOn(Chatapi.prototype, 'responseToMessages')
      .mockImplementation(() => {
        return []
      })

    const licensee = await Licensee.create({
      licenseKind: 'demo',
      name: 'Alcatéia',
      whatsappDefault: 'chatapi',
      whatsappUrl: 'https://whatsapp.com',
      whatsappToken: 'bshg25f',
      chatbotUrl: 'https://whatsapp.url',
      chatbotAuthorizationToken: 'ljsdf12g',
      chatUrl: 'https://chat.url',
    })

    const body = await Body.create({
      content: {
        message: {
          type: 'typein',
        },
      },
      licensee: licensee._id,
    })

    const data = {
      bodyId: body._id,
    }

    const actions = await transformMessengerBody(data)

    expect(messengerPluginResponseToMessages).toHaveBeenCalledWith(body.content)

    const bodyDeleted = await Body.findById(body._id)
    expect(bodyDeleted).toEqual(null)

    expect(actions.length).toEqual(0)
  })
})
