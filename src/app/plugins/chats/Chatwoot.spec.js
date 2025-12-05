import { Chatwoot } from './Chatwoot.js'
import Room from '@models/Room'
import Trigger from '@models/Trigger'
import fetchMock from 'fetch-mock'
import mongoServer from '../../../../.jest/utils'
import { licensee as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { room as roomFactory } from '@factories/room'
import { message as messageFactory } from '@factories/message'
import { triggerReplyButton as triggerReplyButtonFactory } from '@factories/trigger'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { ContactRepositoryDatabase } from '@repositories/contact'
import { MessageRepositoryDatabase } from '@repositories/message'

jest.mock('uuid', () => ({ v4: () => '150bdb15-4c55-42ac-bc6c-970d620fdb6d' }))

describe('Chatwoot plugin', () => {
  let licensee
  const consoleInfoSpy = jest.spyOn(global.console, 'info').mockImplementation()
  const consoleErrorSpy = jest.spyOn(global.console, 'error').mockImplementation()

  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
    fetchMock.reset()

    const licenseeRepository = new LicenseeRepositoryDatabase()
    licensee = await licenseeRepository.create(
      licenseeFactory.build({
        chatIdentifier: 'inbox_123',
        chatKey: 'api_token_123',
      }),
    )
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#responseToMessages', () => {
    it('returns the response body transformed in messages', async () => {
      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(
        contactFactory.build({
          name: 'John Doe',
          chatwootId: 'contact_123',
          licensee,
        }),
      )

      const room = await Room.create(
        roomFactory.build({
          roomId: 'conversation_456',
          contact,
        }),
      )

      const responseBody = {
        event: 'message_created',
        message_type: 'outgoing',
        conversation: {
          id: 'conversation_456',
          contact_inbox: {
            contact_id: 'contact_123',
          },
          messages: [
            {
              content: 'Hello world',
              attachments: [],
            },
          ],
        },
      }

      const chatwoot = new Chatwoot(licensee)
      const messages = await chatwoot.responseToMessages(responseBody)

      expect(messages[0].licensee).toEqual(licensee._id)
      expect(messages[0].contact).toEqual(contact._id)
      expect(messages[0].room._id).toEqual(room._id)
      expect(messages[0].kind).toEqual('text')
      expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
      expect(messages[0].destination).toEqual('to-messenger')
      expect(messages[0].text).toEqual('Hello world')

      expect(messages.length).toEqual(1)
    })

    it('returns empty array if event is not message_created', async () => {
      const responseBody = {
        event: 'conversation_status_changed',
        message_type: 'outgoing',
        conversation: {
          id: 'conversation_456',
          messages: [],
        },
      }

      const chatwoot = new Chatwoot(licensee)
      const messages = await chatwoot.responseToMessages(responseBody)

      expect(messages).toEqual([])
    })

    it('returns empty array if message_type is not outgoing', async () => {
      const responseBody = {
        event: 'message_created',
        message_type: 'incoming',
        conversation: {
          id: 'conversation_456',
          messages: [],
        },
      }

      const chatwoot = new Chatwoot(licensee)
      const messages = await chatwoot.responseToMessages(responseBody)

      expect(messages).toEqual([])
    })

    it('returns empty array if contact is not found', async () => {
      const responseBody = {
        event: 'message_created',
        message_type: 'outgoing',
        conversation: {
          id: 'conversation_456',
          contact_inbox: {
            contact_id: 'non_existent_contact',
          },
          messages: [
            {
              content: 'Hello world',
              attachments: [],
            },
          ],
        },
      }

      const chatwoot = new Chatwoot(licensee)
      const messages = await chatwoot.responseToMessages(responseBody)

      expect(messages).toEqual([])
    })

    it('creates new room if room does not exist', async () => {
      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(
        contactFactory.build({
          name: 'John Doe',
          chatwootId: 'contact_123',
          licensee,
        }),
      )

      const responseBody = {
        event: 'message_created',
        message_type: 'outgoing',
        conversation: {
          id: 'new_conversation_789',
          contact_inbox: {
            contact_id: 'contact_123',
          },
          messages: [
            {
              content: 'Hello world',
              attachments: [],
            },
          ],
        },
      }

      const chatwoot = new Chatwoot(licensee)
      const messages = await chatwoot.responseToMessages(responseBody)

      expect(messages).toEqual([])

      const newRoom = await Room.findOne({ roomId: 'new_conversation_789' })
      expect(newRoom).toBeTruthy()
      expect(newRoom.contact.toString()).toEqual(contact._id.toString())
    })

    it('returns close-chat message when conversation status is resolved', async () => {
      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(
        contactFactory.build({
          name: 'John Doe',
          chatwootId: 'contact_123',
          licensee,
        }),
      )

      const room = await Room.create(
        roomFactory.build({
          roomId: 'conversation_456',
          contact,
        }),
      )

      const responseBody = {
        event: 'conversation_status_changed',
        status: 'resolved',
        id: 'conversation_456',
        contact_inbox: {
          contact_id: 'contact_123',
        },
      }

      const chatwoot = new Chatwoot(licensee)
      const messages = await chatwoot.responseToMessages(responseBody)

      expect(messages.length).toEqual(1)
      expect(messages[0].licensee).toEqual(licensee._id)
      expect(messages[0].contact).toEqual(contact._id)
      expect(messages[0].room._id).toEqual(room._id)
      expect(messages[0].kind).toEqual('text')
      expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
      expect(messages[0].destination).toEqual('to-messenger')
      expect(messages[0].text).toEqual('Chat encerrado pelo agente')
    })

    describe('message types', () => {
      it('returns message from responseBody.content when content and content_type are present', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            chatwootId: 'contact_123',
            licensee,
          }),
        )

        await Room.create(
          roomFactory.build({
            roomId: 'conversation_456',
            contact,
          }),
        )

        const responseBody = {
          event: 'message_created',
          message_type: 'outgoing',
          content: 'Direct message from content',
          content_type: 'text',
          conversation: {
            id: 'conversation_456',
            contact_inbox: {
              contact_id: 'contact_123',
            },
            messages: [
              {
                content: 'This should be ignored',
                attachments: [],
              },
            ],
          },
        }

        const chatwoot = new Chatwoot(licensee)
        const messages = await chatwoot.responseToMessages(responseBody)

        expect(messages.length).toEqual(1)
        expect(messages[0].kind).toEqual('text')
        expect(messages[0].text).toEqual('Direct message from content')
        expect(messages[0].text).not.toEqual('This should be ignored')
      })

      it('includes senderName when useSenderName is true and responseBody.content exists', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licenseeWithSenderName = await licenseeRepository.create(
          licenseeFactory.build({
            chatIdentifier: 'inbox_123',
            chatKey: 'api_token_123',
            useSenderName: true,
          }),
        )

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            chatwootId: 'contact_123',
            licensee: licenseeWithSenderName,
          }),
        )

        await Room.create(
          roomFactory.build({
            roomId: 'conversation_456',
            contact,
          }),
        )

        const responseBody = {
          event: 'message_created',
          message_type: 'outgoing',
          content: 'Message with sender name',
          content_type: 'text',
          conversation: {
            id: 'conversation_456',
            contact_inbox: {
              contact_id: 'contact_123',
            },
            meta: {
              assignee: {
                available_name: 'Agent Smith',
              },
            },
            messages: [],
          },
        }

        const chatwoot = new Chatwoot(licenseeWithSenderName)
        const messages = await chatwoot.responseToMessages(responseBody)

        expect(messages.length).toEqual(1)
        expect(messages[0].kind).toEqual('text')
        expect(messages[0].text).toEqual('Message with sender name')
        expect(messages[0].senderName).toEqual('Agent Smith')
      })

      it('does not include senderName when useSenderName is false and responseBody.content exists', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            chatwootId: 'contact_123',
            licensee,
          }),
        )

        await Room.create(
          roomFactory.build({
            roomId: 'conversation_456',
            contact,
          }),
        )

        const responseBody = {
          event: 'message_created',
          message_type: 'outgoing',
          content: 'Message without sender name',
          content_type: 'text',
          conversation: {
            id: 'conversation_456',
            contact_inbox: {
              contact_id: 'contact_123',
            },
            meta: {
              assignee: {
                available_name: 'Agent Smith',
              },
            },
            messages: [],
          },
        }

        const chatwoot = new Chatwoot(licensee)
        const messages = await chatwoot.responseToMessages(responseBody)

        expect(messages.length).toEqual(1)
        expect(messages[0].kind).toEqual('text')
        expect(messages[0].text).toEqual('Message without sender name')
        expect(messages[0].senderName).toEqual(undefined)
      })

      it('returns messages with file data if message has attachments', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            chatwootId: 'contact_123',
            licensee,
          }),
        )

        await Room.create(
          roomFactory.build({
            roomId: 'conversation_456',
            contact,
          }),
        )

        const responseBody = {
          event: 'message_created',
          message_type: 'outgoing',
          conversation: {
            id: 'conversation_456',
            contact_inbox: {
              contact_id: 'contact_123',
            },
            messages: [
              {
                content: '',
                attachments: [
                  {
                    file_type: 'image/jpeg',
                    data_url: 'https://example.com/image.jpg',
                  },
                ],
              },
            ],
          },
        }

        const chatwoot = new Chatwoot(licensee)
        const messages = await chatwoot.responseToMessages(responseBody)

        expect(messages[0].kind).toEqual('file')
        expect(messages[0].text).toEqual(undefined)
        expect(messages[0].url).toEqual('https://example.com/image.jpg')
        expect(messages[0].fileName).toEqual('image/jpeg')
      })

      it('returns messages with interactive data if text matches trigger expression', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            chatwootId: 'contact_123',
            licensee,
          }),
        )

        await Room.create(
          roomFactory.build({
            roomId: 'conversation_456',
            contact,
          }),
        )

        const trigger = await Trigger.create(
          triggerReplyButtonFactory.build({ licensee, expression: 'send_reply_buttons' }),
        )

        const responseBody = {
          event: 'message_created',
          message_type: 'outgoing',
          conversation: {
            id: 'conversation_456',
            contact_inbox: {
              contact_id: 'contact_123',
            },
            messages: [
              {
                content: 'send_reply_buttons',
                attachments: [],
              },
            ],
          },
        }

        const chatwoot = new Chatwoot(licensee)
        const messages = await chatwoot.responseToMessages(responseBody)

        expect(messages[0].kind).toEqual('interactive')
        expect(messages[0].text).toEqual('send_reply_buttons')
        expect(messages[0].trigger).toEqual(trigger._id)
      })

      it('returns message of kind template if text contains {{ and }}', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            chatwootId: 'contact_123',
            licensee,
          }),
        )

        await Room.create(
          roomFactory.build({
            roomId: 'conversation_456',
            contact,
          }),
        )

        const responseBody = {
          event: 'message_created',
          message_type: 'outgoing',
          conversation: {
            id: 'conversation_456',
            contact_inbox: {
              contact_id: 'contact_123',
            },
            messages: [
              {
                content: '{{name}}',
                attachments: [],
              },
            ],
          },
        }

        const chatwoot = new Chatwoot(licensee)
        const messages = await chatwoot.responseToMessages(responseBody)

        expect(messages[0].kind).toEqual('template')
        expect(messages[0].text).toEqual('{{name}}')
      })

      it('formats message for group contacts', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            chatwootId: 'contact_123',
            type: '@g.us',
            licensee,
          }),
        )

        await Room.create(
          roomFactory.build({
            roomId: 'conversation_456',
            contact,
          }),
        )

        const responseBody = {
          event: 'message_created',
          message_type: 'outgoing',
          conversation: {
            id: 'conversation_456',
            contact_inbox: {
              contact_id: 'contact_123',
            },
            messages: [
              {
                content: 'Hello group',
                attachments: [],
              },
            ],
          },
        }

        const chatwoot = new Chatwoot(licensee)
        const messages = await chatwoot.responseToMessages(responseBody)

        expect(messages[0].text).toEqual('Hello group')
      })
    })
  })

  describe('#sendMessage', () => {
    describe('when contact has chatwootSourceId', () => {
      it('sends message to existing conversation', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            chatwootSourceId: 'source_123',
            licensee,
          }),
        )

        await Room.create(
          roomFactory.build({
            roomId: 'conversation_456',
            contact,
            closed: false,
          }),
        )

        const messageRepository = new MessageRepositoryDatabase()
        const message = await messageRepository.create(
          messageFactory.build({
            text: 'Message to send',
            contact,
            licensee,
            sended: false,
          }),
        )

        fetchMock.postOnce('https://api.chatwoot.com/api/v1/conversations/conversation_456/messages', {
          status: 200,
          body: {
            error: false,
            success: true,
          },
        })

        const chatwoot = new Chatwoot(licensee)
        await chatwoot.sendMessage(message._id, 'https://api.chatwoot.com/api/v1/')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        const messageUpdated = await messageRepository.findFirst({ _id: message._id })
        expect(messageUpdated.sended).toEqual(true)
      })

      it('creates new conversation if no open room exists', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            chatwootSourceId: 'source_123',
            chatwootId: 'contact_123',
            licensee,
          }),
        )

        const messageRepository = new MessageRepositoryDatabase()
        const message = await messageRepository.create(
          messageFactory.build({
            text: 'Message to send',
            contact,
            licensee,
            sended: false,
          }),
        )

        fetchMock.postOnce('https://api.chatwoot.com/api/v1/conversations', {
          status: 200,
          body: {
            id: 'new_conversation_789',
          },
        })

        fetchMock.postOnce('https://api.chatwoot.com/api/v1/conversations/new_conversation_789/messages', {
          status: 200,
          body: {
            error: false,
            success: true,
          },
        })

        const chatwoot = new Chatwoot(licensee)
        await chatwoot.sendMessage(message._id, 'https://api.chatwoot.com/api/v1/')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(2)

        const messageUpdated = await messageRepository.findFirst({ _id: message._id })
        expect(messageUpdated.sended).toEqual(true)
      })
    })

    describe('when contact does not have chatwootSourceId', () => {
      it('searches for existing contact and updates it', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            number: '5511999999999',
            licensee,
          }),
        )

        const messageRepository = new MessageRepositoryDatabase()
        const message = await messageRepository.create(
          messageFactory.build({
            text: 'Message to send',
            contact,
            licensee,
            sended: false,
          }),
        )

        fetchMock.getOnce('https://api.chatwoot.com/api/v1/contacts/search?q=+5511999999999', {
          status: 200,
          body: {
            payload: [
              {
                id: 'contact_123',
                contact_inboxes: [
                  {
                    inbox: {
                      id: 'inbox_123',
                    },
                    source_id: 'source_123',
                  },
                ],
              },
            ],
          },
        })

        fetchMock.postOnce('https://api.chatwoot.com/api/v1/conversations', {
          status: 200,
          body: {
            id: 'new_conversation_789',
          },
        })

        fetchMock.postOnce('https://api.chatwoot.com/api/v1/conversations/new_conversation_789/messages', {
          status: 200,
          body: {
            error: false,
            success: true,
          },
        })

        const chatwoot = new Chatwoot(licensee)
        await chatwoot.sendMessage(message._id, 'https://api.chatwoot.com/api/v1/')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(3)

        const contactUpdated = await contactRepository.findFirst({ _id: contact._id })
        expect(contactUpdated.chatwootId).toEqual('contact_123')
        expect(contactUpdated.chatwootSourceId).toEqual('source_123')

        const messageUpdated = await messageRepository.findFirst({ _id: message._id })
        expect(messageUpdated.sended).toEqual(true)
      })

      it('creates new contact if search returns no results', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            number: '5511999999999',
            email: 'john@example.com',
            address: 'Rua Teste',
            address_number: '123',
            address_complement: 'Apto 1',
            neighborhood: 'Centro',
            city: 'São Paulo',
            cep: '01234-567',
            uf: 'SP',
            licensee,
          }),
        )

        const messageRepository = new MessageRepositoryDatabase()
        const message = await messageRepository.create(
          messageFactory.build({
            text: 'Message to send',
            contact,
            licensee,
            sended: false,
          }),
        )

        // Mock contact search - no results
        fetchMock.getOnce('https://api.chatwoot.com/api/v1/contacts/search?q=+5511999999999', {
          status: 200,
          body: {
            payload: [],
          },
        })

        // Mock contact creation
        fetchMock.postOnce('https://api.chatwoot.com/api/v1/contacts', {
          status: 200,
          body: {
            payload: {
              contact: {
                id: 'contact_123',
              },
              contact_inbox: {
                source_id: 'source_123',
              },
            },
          },
        })

        // Mock conversation creation
        fetchMock.postOnce('https://api.chatwoot.com/api/v1/conversations', {
          status: 200,
          body: {
            id: 'new_conversation_789',
          },
        })

        // Mock message sending
        fetchMock.postOnce('https://api.chatwoot.com/api/v1/conversations/new_conversation_789/messages', {
          status: 200,
          body: {
            error: false,
            success: true,
          },
        })

        const chatwoot = new Chatwoot(licensee)
        await chatwoot.sendMessage(message._id, 'https://api.chatwoot.com/api/v1/')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(4)

        const contactUpdated = await contactRepository.findFirst({ _id: contact._id })
        expect(contactUpdated.chatwootId).toEqual('contact_123')
        expect(contactUpdated.chatwootSourceId).toEqual('source_123')

        const messageUpdated = await messageRepository.findFirst({ _id: message._id })
        expect(messageUpdated.sended).toEqual(true)
      })
    })

    describe('message types', () => {
      it('sends file message with multipart form data', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            chatwootSourceId: 'source_123',
            licensee,
          }),
        )

        await Room.create(
          roomFactory.build({
            roomId: 'conversation_456',
            contact,
            closed: false,
          }),
        )

        const messageRepository = new MessageRepositoryDatabase()
        const message = await messageRepository.create(
          messageFactory.build({
            kind: 'file',
            fileName: 'file.pdf',
            url: 'https://example.com/file.pdf',
            contact,
            licensee,
            sended: false,
          }),
        )

        // Mock file download
        fetchMock.getOnce('https://example.com/file.pdf', {
          status: 200,
          body: 'file content',
          headers: { 'content-type': 'application/pdf' },
        })

        fetchMock.postOnce('https://api.chatwoot.com/api/v1/conversations/conversation_456/messages', {
          status: 200,
          body: {
            error: false,
            success: true,
          },
        })

        const chatwoot = new Chatwoot(licensee)
        await chatwoot.sendMessage(message._id, 'https://api.chatwoot.com/api/v1/')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(2)

        const messageUpdated = await messageRepository.findFirst({ _id: message._id })
        expect(messageUpdated.sended).toEqual(true)
      })

      it('sends form message for other message types', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            chatwootSourceId: 'source_123',
            licensee,
          }),
        )

        await Room.create(
          roomFactory.build({
            roomId: 'conversation_456',
            contact,
            closed: false,
          }),
        )

        const messageRepository = new MessageRepositoryDatabase()
        const message = await messageRepository.create(
          messageFactory.build({
            kind: 'location',
            contact,
            licensee,
            sended: false,
          }),
        )

        fetchMock.postOnce('https://api.chatwoot.com/api/v1/conversations/conversation_456/messages', {
          status: 200,
          body: {
            error: false,
            success: true,
          },
        })

        const chatwoot = new Chatwoot(licensee)
        await chatwoot.sendMessage(message._id, 'https://api.chatwoot.com/api/v1/')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        const messageUpdated = await messageRepository.findFirst({ _id: message._id })
        expect(messageUpdated.sended).toEqual(true)
      })
    })

    describe('error handling', () => {
      it('logs error when message sending fails', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            chatwootSourceId: 'source_123',
            licensee,
          }),
        )

        await Room.create(
          roomFactory.build({
            roomId: 'conversation_456',
            contact,
            closed: false,
          }),
        )

        const messageRepository = new MessageRepositoryDatabase()
        const message = await messageRepository.create(
          messageFactory.build({
            _id: '60958703f415ed4008748637',
            text: 'Message to send',
            contact,
            licensee,
            sended: false,
          }),
        )

        fetchMock.postOnce('https://api.chatwoot.com/api/v1/conversations/conversation_456/messages', {
          status: 400,
          body: {
            error: true,
            message: 'Invalid message',
          },
        })

        const chatwoot = new Chatwoot(licensee)
        await chatwoot.sendMessage(message._id, 'https://api.chatwoot.com/api/v1/')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        const messageUpdated = await messageRepository.findFirst({ _id: message._id })
        expect(messageUpdated.sended).toEqual(false)
        expect(messageUpdated.error).toEqual('mensagem: {"error":true,"message":"Invalid message"}')

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          `Chatwoot - erro: Mensagem 60958703f415ed4008748637 não enviada para Chatwoot.
           status: 400
           mensagem: {"error":true,"message":"Invalid message"}`,
        )
      })

      it('logs success message when message is sent successfully', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            chatwootSourceId: 'source_123',
            licensee,
          }),
        )

        await Room.create(
          roomFactory.build({
            roomId: 'conversation_456',
            contact,
            closed: false,
          }),
        )

        const messageRepository = new MessageRepositoryDatabase()
        const message = await messageRepository.create(
          messageFactory.build({
            _id: '60958703f415ed4008748637',
            text: 'Message to send',
            contact,
            licensee,
            sended: false,
          }),
        )

        fetchMock.postOnce('https://api.chatwoot.com/api/v1/conversations/conversation_456/messages', {
          status: 200,
          body: {
            error: false,
            success: true,
          },
        })

        const chatwoot = new Chatwoot(licensee)
        await chatwoot.sendMessage(message._id, 'https://api.chatwoot.com/api/v1/')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleInfoSpy).toHaveBeenCalledWith(
          'Chatwoot: Mensagem 60958703f415ed4008748637 enviada para Chatwoot com sucesso!',
        )
      })
    })
  })

  describe('#transfer', () => {
    it('changes talkingWithChatBot to false and sends message', async () => {
      const sendMessageSpy = jest.spyOn(Chatwoot.prototype, 'sendMessage').mockImplementation(async () => {})

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(
        contactFactory.build({
          name: 'John Doe',
          talkingWithChatBot: true,
          licensee,
        }),
      )

      const messageRepository = new MessageRepositoryDatabase()
      const message = await messageRepository.create(
        messageFactory.build({
          _id: '60958703f415ed4008748637',
          text: 'Message to send',
          contact,
          licensee,
          sended: false,
        }),
      )

      expect(contact.talkingWithChatBot).toEqual(true)

      const chatwoot = new Chatwoot(licensee)
      await chatwoot.transfer(message._id, 'https://api.chatwoot.com/api/v1/')

      const modifiedContact = await contactRepository.findFirst({ _id: contact._id })
      expect(modifiedContact.talkingWithChatBot).toEqual(false)

      expect(sendMessageSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('#closeChat', () => {
    describe('when licensee uses chatbot', () => {
      it('changes talkingWithChatBot to true', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(
          licenseeFactory.build({
            useChatbot: true,
            chatbotDefault: 'landbot',
            chatbotUrl: 'https://url.com',
            chatbotAuthorizationToken: 'token',
          }),
        )

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: false,
            licensee,
          }),
        )

        const room = await Room.create(
          roomFactory.build({
            roomId: 'conversation_456',
            contact,
          }),
        )

        const messageRepository = new MessageRepositoryDatabase()
        const message = await messageRepository.create(
          messageFactory.build({
            _id: '60958703f415ed4008748637',
            text: 'Message to send',
            contact,
            licensee,
            room,
            sended: false,
          }),
        )

        expect(contact.talkingWithChatBot).toEqual(false)

        const chatwoot = new Chatwoot(licensee)
        const messages = await chatwoot.closeChat(message._id)

        const modifiedContact = await contactRepository.findFirst({ _id: contact._id })
        expect(modifiedContact.talkingWithChatBot).toEqual(true)

        expect(messages.length).toEqual(0)
      })
    })

    describe('when licensee has messageOnCloseChat', () => {
      it('creates messages to send before closing chat', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(
          licenseeFactory.build({
            useChatbot: true,
            chatbotDefault: 'landbot',
            chatbotUrl: 'https://url.com',
            chatbotAuthorizationToken: 'token',
            messageOnCloseChat: 'Chat closed message',
          }),
        )

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: false,
            licensee,
          }),
        )

        const room = await Room.create(
          roomFactory.build({
            roomId: 'conversation_456',
            contact,
          }),
        )

        const messageRepository = new MessageRepositoryDatabase()
        const message = await messageRepository.create(
          messageFactory.build({
            _id: '60958703f415ed4008748637',
            text: 'Message to send',
            contact,
            licensee,
            room,
            sended: false,
          }),
        )

        expect(contact.talkingWithChatBot).toEqual(false)

        const chatwoot = new Chatwoot(licensee)
        const messages = await chatwoot.closeChat(message._id)

        const modifiedContact = await contactRepository.findFirst({ _id: contact._id })
        expect(modifiedContact.talkingWithChatBot).toEqual(true)

        expect(messages.length).toEqual(1)
        expect(messages[0].text).toEqual('Chat closed message')
        expect(messages[0].kind).toEqual('text')
        expect(messages[0].destination).toEqual('to-messenger')
      })
    })
  })

  describe('#action', () => {
    it('returns "close-chat" when conversation status is resolved', () => {
      const responseBody = {
        event: 'conversation_status_changed',
        status: 'resolved',
      }

      const chatwoot = new Chatwoot(licensee)
      expect(chatwoot.action(responseBody)).toEqual('close-chat')
    })

    it('returns "send-message-to-messenger" for other events', () => {
      const responseBody = {
        event: 'message_created',
        message_type: 'outgoing',
      }

      const chatwoot = new Chatwoot(licensee)
      expect(chatwoot.action(responseBody)).toEqual('send-message-to-messenger')
    })
  })
})
