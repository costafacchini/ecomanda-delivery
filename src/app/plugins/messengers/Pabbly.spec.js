import { Pabbly } from './Pabbly.js'
import Trigger from '../../models/Trigger.js'
import Template from '../../models/Template.js'
import { MessageRepositoryDatabase } from '../../repositories/message.js'
import { NormalizePhone } from '../../helpers/NormalizePhone.js'

jest.mock('../../models/Trigger')
jest.mock('../../models/Template')
jest.mock('../../repositories/message')
jest.mock('../../services/request')
jest.mock('../../helpers/Files')
jest.mock('../../helpers/NormalizePhone')
jest.mock('../../helpers/ParseTriggerText')

import request from '../../services/request.js'
import { isPhoto, isVideo, isMidia, isVoice } from '../../helpers/Files.js'

describe('Pabbly Plugin', () => {
  let pabbly
  let mockLicensee

  beforeEach(() => {
    mockLicensee = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Test Licensee',
      whatsappDefault: 'pabbly',
      whatsappToken: 'test-token',
      whatsappUrl: 'https://api.pabbly.com/v1',
      urlWhatsappWebhook: 'https://example.com/webhook',
      phone: '5511999999999',
      useChatbot: false,
    }

    pabbly = new Pabbly(mockLicensee)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create Pabbly instance with licensee', () => {
      expect(pabbly.licensee).toBe(mockLicensee)
    })
  })

  describe('action', () => {
    it('should return correct action for to-chat destination', () => {
      expect(pabbly.action('to-chat')).toBe('send-message-to-chat')
    })

    it('should return correct action for to-messenger destination', () => {
      expect(pabbly.action('to-messenger')).toBe('send-message-to-messenger')
    })

    it('should return correct action for to-chatbot destination', () => {
      expect(pabbly.action('to-chatbot')).toBe('send-message-to-chatbot')
    })
  })

  describe('parseMessageStatus', () => {
    it('should set messageStatus to null', () => {
      pabbly.parseMessageStatus({})
      expect(pabbly.messageStatus).toBeNull()
    })
  })

  describe('parseMessage', () => {
    it('should parse text message correctly', () => {
      const responseBody = {
        data: {
          name: 'message_received',
          event_data: {
            id: 'message-id',
            type: 'text',
            text: { body: 'Hello World' },
          },
        },
      }

      pabbly.parseMessage(responseBody)
      expect(pabbly.messageData).toEqual({
        kind: 'text',
        waId: 'message-id',
        text: { body: 'Hello World' },
      })
    })

    it('should parse image message correctly', () => {
      const responseBody = {
        data: {
          name: 'message_received',
          event_data: {
            id: 'message-id',
            type: 'image',
            image: {
              id: 'image-id',
              url: 'https://example.com/image.jpg',
              sha256: 'image-hash',
              caption: 'Image caption',
            },
          },
        },
      }

      pabbly.parseMessage(responseBody)
      expect(pabbly.messageData).toEqual({
        kind: 'file',
        waId: 'message-id',
        file: {
          id: 'image-id',
          fileName: 'image-hash',
          caption: 'Image caption',
          fileBase64: null,
        },
      })
    })

    it('should parse video message correctly', () => {
      const responseBody = {
        data: {
          name: 'message_received',
          event_data: {
            id: 'message-id',
            type: 'video',
            video: {
              id: 'video-id',
              url: 'https://example.com/video.mp4',
              sha256: 'video-hash',
              caption: 'Video caption',
            },
          },
        },
      }

      pabbly.parseMessage(responseBody)
      expect(pabbly.messageData).toEqual({
        kind: 'file',
        waId: 'message-id',
        file: {
          id: 'video-id',
          fileName: 'video-hash',
          caption: 'Video caption',
          fileBase64: null,
        },
      })
    })

    it('should parse voice message correctly', () => {
      const responseBody = {
        data: {
          name: 'message_received',
          event_data: {
            id: 'message-id',
            type: 'voice',
            voice: {
              id: 'voice-id',
              url: 'https://example.com/voice.opus',
              sha256: 'voice-hash',
              caption: 'Voice caption',
            },
          },
        },
      }

      pabbly.parseMessage(responseBody)
      expect(pabbly.messageData).toEqual({
        kind: 'file',
        waId: 'message-id',
        file: {
          id: 'voice-id',
          fileName: 'voice-hash',
          caption: 'Voice caption',
          fileBase64: null,
        },
      })
    })

    it('should parse audio message correctly', () => {
      const responseBody = {
        data: {
          name: 'message_received',
          event_data: {
            id: 'message-id',
            type: 'audio',
            audio: {
              id: 'audio-id',
              url: 'https://example.com/audio.mp3',
              sha256: 'audio-hash',
              caption: 'Audio caption',
            },
          },
        },
      }

      pabbly.parseMessage(responseBody)
      expect(pabbly.messageData).toEqual({
        kind: 'file',
        waId: 'message-id',
        file: {
          id: 'audio-id',
          fileName: 'audio-hash',
          caption: 'Audio caption',
          fileBase64: null,
        },
      })
    })

    it('should parse document message correctly', () => {
      const responseBody = {
        data: {
          name: 'message_received',
          event_data: {
            id: 'message-id',
            type: 'document',
            document: {
              id: 'doc-id',
              url: 'https://example.com/document.pdf',
              filename: 'document.pdf',
              caption: 'Document caption',
            },
          },
        },
      }

      pabbly.parseMessage(responseBody)
      expect(pabbly.messageData).toEqual({
        kind: 'file',
        waId: 'message-id',
        file: {
          id: 'doc-id',
          fileName: 'document.pdf',
          caption: 'Document caption',
          fileBase64: null,
        },
      })
    })

    it('should parse location message correctly', () => {
      const responseBody = {
        data: {
          name: 'message_received',
          event_data: {
            id: 'message-id',
            type: 'location',
            location: {
              latitude: -23.5505,
              longitude: -46.6333,
            },
          },
        },
      }

      pabbly.parseMessage(responseBody)
      expect(pabbly.messageData).toEqual({
        kind: 'location',
        waId: 'message-id',
        latitude: -23.5505,
        longitude: -46.6333,
      })
    })

    it('should handle missing data', () => {
      const responseBody = {}
      pabbly.parseMessage(responseBody)
      expect(pabbly.messageData).toBeNull()
    })

    it('should handle wrong event name', () => {
      const responseBody = {
        data: {
          name: 'wrong_event',
          event_data: {
            id: 'message-id',
            type: 'text',
            text: { body: 'Hello World' },
          },
        },
      }

      pabbly.parseMessage(responseBody)
      expect(pabbly.messageData).toBeNull()
    })

    it('should skip unsupported message types', () => {
      const unsupportedTypes = [
        'sticker',
        'ephemeral',
        'reaction',
        'contacts',
        'unsupported',
        'system',
        'button',
        'order',
        'interactive',
      ]

      unsupportedTypes.forEach((type) => {
        const responseBody = {
          data: {
            name: 'message_received',
            event_data: {
              id: 'message-id',
              type: type,
            },
          },
        }

        pabbly.parseMessage(responseBody)
        expect(pabbly.messageData).toBeNull()
      })
    })

    it('should parse echoes message correctly', () => {
      const responseBody = {
        data: {
          name: 'smb_message_echoes',
          event_data: {
            id: 'message-id',
            type: 'text',
            text: { body: 'Hello World' },
          },
        },
      }

      pabbly.parseMessage(responseBody)
      expect(pabbly.messageData).toEqual({
        kind: 'text',
        waId: 'message-id',
        text: { body: 'Hello World' },
      })
    })
  })

  describe('parseContactData', () => {
    it('should parse contact data correctly', () => {
      const mockNormalizePhone = {
        number: '5511999999999',
        type: '@c.us',
      }
      NormalizePhone.mockImplementation(() => mockNormalizePhone)

      const responseBody = {
        data: {
          name: 'message_received',
          event_data: {
            from: '5511999999999',
          },
        },
      }

      pabbly.parseContactData(responseBody)
      expect(pabbly.contactData).toEqual({
        number: '5511999999999',
        type: '@c.us',
        name: '5511999999999',
        wa_start_chat: expect.any(Date),
      })
    })

    it('should handle missing data', () => {
      const responseBody = {}
      pabbly.parseContactData(responseBody)
      expect(pabbly.contactData).toBeNull()
    })

    it('should handle wrong event name', () => {
      const responseBody = {
        data: {
          name: 'wrong_event',
          event_data: {
            from: '5511999999999',
          },
        },
      }

      pabbly.parseContactData(responseBody)
      expect(pabbly.contactData).toBeNull()
    })
  })

  describe('contactWithDifferentData', () => {
    it('should always return false', () => {
      expect(pabbly.contactWithDifferentData({})).toBe(false)
    })
  })

  describe('shouldUpdateWaStartChat', () => {
    it('should return true when contact has no wa_start_chat', () => {
      const contact = {}
      expect(pabbly.shouldUpdateWaStartChat(contact)).toBe(true)
    })

    it('should return false when contact has wa_start_chat', () => {
      const contact = { wa_start_chat: new Date() }
      expect(pabbly.shouldUpdateWaStartChat(contact)).toBe(false)
    })
  })

  describe('sendMessage', () => {
    let mockMessageRepository
    let mockMessage

    beforeEach(() => {
      mockMessage = {
        _id: 'message-id',
        kind: 'text',
        text: 'Hello World',
        contact: {
          _id: 'contact-id',
          number: '5511999999999',
          waId: 'wa-id-123',
        },
        save: jest.fn(),
      }

      mockMessageRepository = {
        findFirst: jest.fn().mockResolvedValue(mockMessage),
      }

      MessageRepositoryDatabase.mockImplementation(() => mockMessageRepository)
    })

    it('should send text message successfully', async () => {
      request.post.mockResolvedValue({
        status: 200,
        data: { data: { metaResponse: { messages: [{ id: 'sent-message-id' }] } } },
      })

      await pabbly.sendMessage('message-id', 'https://api.pabbly.com/v1', 'test-token')

      expect(request.post).toHaveBeenCalledWith('https://api.pabbly.com/v1/messages', {
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
        body: {
          to: '+5511999999999',
          type: 'text',
          message: 'Hello World',
        },
      })

      expect(mockMessage.sended).toBe(true)
      expect(mockMessage.messageWaId).toBe('sent-message-id')
      expect(mockMessage.save).toHaveBeenCalled()
    })

    it('should send text message with sender name', async () => {
      mockMessage.senderName = 'John Doe'
      request.post.mockResolvedValue({
        status: 200,
        data: { messages: [{ id: 'sent-message-id' }] },
      })

      await pabbly.sendMessage('message-id', 'https://api.pabbly.com/v1', 'test-token')

      expect(request.post).toHaveBeenCalledWith('https://api.pabbly.com/v1/messages', {
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
        body: {
          to: '+5511999999999',
          type: 'text',
          message: '*John Doe:*\nHello World',
        },
      })
    })

    it('should send template message successfully', async () => {
      const mockTemplate = {
        name: 'welcome_template',
        namespace: 'test_namespace',
        language: 'pt_BR',
        headerParams: [],
        bodyParams: [{ number: '1', format: 'text' }],
        footerParams: [],
      }

      Template.findOne.mockResolvedValue(mockTemplate)

      mockMessage.kind = 'template'
      mockMessage.text = '{{welcome_template}} {{John}}'

      request.post.mockResolvedValue({
        status: 200,
        data: { messages: [{ id: 'sent-message-id' }] },
      })

      await pabbly.sendMessage('message-id', 'https://api.pabbly.com/v1', 'test-token')

      expect(request.post).toHaveBeenCalledWith('https://api.pabbly.com/v1/messages', {
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
        body: {
          to: '+5511999999999',
          type: 'template',
          template: {
            namespace: 'test_namespace',
            name: 'welcome_template',
            language: {
              code: 'pt_BR',
              policy: 'deterministic',
            },
            components: [
              {
                type: 'body',
                parameters: [
                  {
                    type: 'text',
                    text: 'John',
                  },
                ],
              },
            ],
          },
        },
      })
    })

    it('should send interactive message with trigger successfully', async () => {
      const mockTrigger = {
        _id: 'trigger-id',
        triggerKind: 'reply_button',
        textReplyButton: JSON.stringify({
          type: 'button',
          body: { text: 'Choose an option' },
          action: {
            buttons: [{ type: 'reply', reply: { id: 'option1', title: 'Option 1' } }],
          },
        }),
      }

      Trigger.findById.mockResolvedValue(mockTrigger)

      mockMessage.kind = 'interactive'
      mockMessage.trigger = 'trigger-id'

      request.post.mockResolvedValue({
        status: 200,
        data: { messages: [{ id: 'sent-message-id' }] },
      })

      await pabbly.sendMessage('message-id', 'https://api.pabbly.com/v1', 'test-token')

      expect(request.post).toHaveBeenCalledWith('https://api.pabbly.com/v1/messages', {
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
        body: {
          to: '+5511999999999',
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: 'Choose an option' },
            action: {
              buttons: [{ type: 'reply', reply: { id: 'option1', title: 'Option 1' } }],
            },
          },
        },
      })
    })

    it('should send file message successfully', async () => {
      isPhoto.mockReturnValue(true)
      isVideo.mockReturnValue(false)
      isMidia.mockReturnValue(false)
      isVoice.mockReturnValue(false)

      mockMessage.kind = 'file'
      mockMessage.url = 'https://example.com/image.jpg'
      mockMessage.fileName = 'image.jpg'
      mockMessage.fileId = 'file-id'

      request.get.mockResolvedValue({
        status: 200,
        data: { status: 'success', data: { mediaUrl: 'https://example.com/image.jpg' } },
      })

      request.post.mockResolvedValue({
        status: 200,
        data: { messages: [{ id: 'sent-message-id' }] },
      })

      await pabbly.sendMessage('message-id', 'https://api.pabbly.com/v1', 'test-token')

      expect(request.post).toHaveBeenCalledWith('https://api.pabbly.com/v1/messages', {
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
        body: {
          to: '+5511999999999',
          type: 'image',
          link: 'https://example.com/image.jpg',
        },
      })
    })

    it('should send location message successfully', async () => {
      mockMessage.kind = 'location'
      mockMessage.latitude = -23.5505
      mockMessage.longitude = -46.6333

      request.post.mockResolvedValue({
        status: 200,
        data: { messages: [{ id: 'sent-message-id' }] },
      })

      await pabbly.sendMessage('message-id', 'https://api.pabbly.com/v1', 'test-token')

      expect(request.post).toHaveBeenCalledWith('https://api.pabbly.com/v1/messages', {
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
        body: {
          to: '+5511999999999',
          type: 'text',
          message: 'longitude: -46.6333, latitude: -23.5505',
        },
      })
    })

    it('should handle send message error', async () => {
      request.post.mockResolvedValue({
        status: 400,
        data: { error: 'Bad Request' },
      })

      await pabbly.sendMessage('message-id', 'https://api.pabbly.com/v1', 'test-token')

      expect(mockMessage.error).toBe('{"error":"Bad Request"}')
      expect(mockMessage.save).toHaveBeenCalled()
    })

    it('should handle network error', async () => {
      const error = new Error('Network Error')
      error.response = { data: { error: 'Network Error' } }
      request.post.mockRejectedValue(error)

      await pabbly.sendMessage('message-id', 'https://api.pabbly.com/v1', 'test-token')

      expect(mockMessage.error).toBe('{"error":"Network Error"}')
      expect(mockMessage.save).toHaveBeenCalled()
    })
  })

  describe('searchTemplates', () => {
    it('should search templates successfully', async () => {
      const mockPabblyTemplates = [
        {
          name: 'welcome_template',
          language: 'pt_BR',
          status: 'APPROVED',
          category: 'UTILITY',
          waTemplateId: 'template-123',
          components: [
            {
              type: 'header',
              format: 'IMAGE',
            },
            {
              type: 'body',
              text: 'Welcome {{1}}!',
            },
          ],
        },
      ]

      request.get.mockResolvedValue({
        status: 200,
        data: { templates: mockPabblyTemplates },
      })

      const result = await pabbly.searchTemplates('https://api.pabbly.com/v1', 'test-token')

      expect(request.get).toHaveBeenCalledWith('https://api.pabbly.com/v1/templates?limit=20&page=1', {
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
      })

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        name: 'welcome_template',
        licensee: '507f1f77bcf86cd799439011',
        language: 'pt_BR',
        active: true,
        category: 'UTILITY',
        officialTemplateId: 'template-123',
        wabaId: 'template-123',
        headerParams: [{ format: 'IMAGE' }],
        bodyParams: [{ number: '1', format: 'text' }],
        footerParams: [],
      })
    })

    it('should handle template search error', async () => {
      request.get.mockRejectedValue(new Error('Template Error'))

      const result = await pabbly.searchTemplates('https://api.pabbly.com/v1', 'test-token')

      expect(result).toEqual([])
    })
  })
})
