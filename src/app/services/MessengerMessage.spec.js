import transformMessengerBody from './MessengerMessage'
import Body from '@models/Body'
import Dialog from '../plugins/messengers/Dialog'
import mongoServer from '.jest/utils'
import { licensee as licenseeFactory } from '@factories/licensee'
import { body as bodyFactory } from '@factories/body'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'

describe('transformMessengerBody', () => {
  let licensee

  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()

    const licenseeRepository = new LicenseeRepositoryDatabase()
    licensee = await licenseeRepository.create(
      licenseeFactory.build({
        whatsappDefault: 'dialog',
        whatsappUrl: 'https://waba.360dialog.io/',
        whatsappToken: 'bshg25f',
        chatbotUrl: 'https://whatsapp.url',
        chatbotAuthorizationToken: 'ljsdf12g',
        chatUrl: 'https://chat.url',
      }),
    )
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('responds with action to send message to chat and chatbot and delete body', async () => {
    const messengerPluginResponseToMessages = jest
      .spyOn(Dialog.prototype, 'responseToMessages')
      .mockImplementation(() => {
        return [
          { _id: 'KSDF656DSD91NSE', destination: 'to-chatbot' },
          { _id: 'OAR8Q54LDN02T', destination: 'to-chat' },
          { _id: 'OAR8Q54743HGD', destination: 'to-messenger' },
        ]
      })

    const body = await Body.create(
      bodyFactory.build({
        content: {
          contacts: [
            {
              profile: {
                name: 'John Doe',
              },
              wa_id: '5511990283745',
            },
          ],
          messages: [
            {
              from: '5511990283745',
              id: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC',
              text: {
                body: 'Message',
              },
              timestamp: '1632784639',
              type: 'text',
            },
          ],
        },
        licensee,
      }),
    )

    const data = {
      bodyId: body._id,
    }

    const actions = await transformMessengerBody(data)

    expect(messengerPluginResponseToMessages).toHaveBeenCalledWith(body.content)

    const bodyDeleted = await Body.findById(body._id)
    expect(bodyDeleted).toEqual(null)

    expect(actions.length).toEqual(3)

    expect(actions[0].action).toEqual('send-message-to-chatbot')
    expect(actions[0].body).toEqual({ messageId: 'KSDF656DSD91NSE', url: 'https://whatsapp.url', token: 'ljsdf12g' })

    expect(actions[1].action).toEqual('send-message-to-chat')
    expect(actions[1].body).toEqual({ messageId: 'OAR8Q54LDN02T', url: 'https://chat.url', token: '' })

    expect(actions[2].action).toEqual('send-message-to-messenger')
    expect(actions[2].body).toEqual({ messageId: 'OAR8Q54743HGD', url: 'https://waba.360dialog.io/', token: 'bshg25f' })
  })

  it('responds with blank actions if body is invalid and delete body', async () => {
    const messengerPluginResponseToMessages = jest
      .spyOn(Dialog.prototype, 'responseToMessages')
      .mockImplementation(() => {
        return []
      })

    const body = await Body.create(
      bodyFactory.build({
        content: {
          message: {
            type: 'typein',
          },
        },
        licensee,
      }),
    )

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
