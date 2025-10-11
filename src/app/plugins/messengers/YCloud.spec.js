import YCloud from './YCloud'
import Trigger from '@models/Trigger'
import Template from '@models/Template'
import { MessageRepositoryDatabase } from '@repositories/message'
import NormalizePhone from '@helpers/NormalizePhone'

jest.mock('@models/Trigger')
jest.mock('@models/Template')
jest.mock('@repositories/message')
jest.mock('../../services/request')
jest.mock('@helpers/Files')
jest.mock('@helpers/NormalizePhone')
jest.mock('@helpers/ParseTriggerText')

import request from '../../services/request'
import files from '@helpers/Files'

describe('YCloud Plugin', () => {
  let ycloud
  let mockLicensee

  beforeEach(() => {
    mockLicensee = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Test Licensee',
      whatsappDefault: 'ycloud',
      whatsappToken: 'test-token',
      whatsappUrl: 'https://api.ycloud.com/v1',
      urlWhatsappWebhook: 'https://example.com/webhook',
      phone: '5511999999999',
      useChatbot: false,
    }

    ycloud = new YCloud(mockLicensee)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create YCloud instance with licensee', () => {
      expect(ycloud.licensee).toBe(mockLicensee)
    })
  })

  describe('action', () => {
    it('should return correct action for to-chat destination', () => {
      expect(ycloud.action('to-chat')).toBe('send-message-to-chat')
    })

    it('should return correct action for to-messenger destination', () => {
      expect(ycloud.action('to-messenger')).toBe('send-message-to-messenger')
    })

    it('should return correct action for to-chatbot destination', () => {
      expect(ycloud.action('to-chatbot')).toBe('send-message-to-chatbot')
    })
  })

  describe('parseMessageStatus', () => {
    it('should parse status updates correctly', () => {
      const responseBody = {
        whatsappMessage: {
          id: 'message-id',
          status: 'sent',
        },
      }

      ycloud.parseMessageStatus(responseBody)
      expect(ycloud.messageStatus).toEqual({
        id: 'message-id',
        status: 'sent',
      })
    })

    it('should handle missing whatsappMessage', () => {
      const responseBody = {}
      ycloud.parseMessageStatus(responseBody)
      expect(ycloud.messageStatus).toBeNull()
    })
  })

  describe('parseMessage', () => {
    it('should parse text message correctly', () => {
      const responseBody = {
        whatsappInboundMessage: {
          id: 'message-id',
          type: 'text',
          text: { body: 'Hello World' },
        },
      }

      ycloud.parseMessage(responseBody)
      expect(ycloud.messageData).toEqual({
        kind: 'text',
        waId: 'message-id',
        text: { body: 'Hello World' },
      })
    })

    it('should parse button message correctly', () => {
      const responseBody = {
        whatsappInboundMessage: {
          id: 'message-id',
          type: 'button',
          button: { text: 'Button Text' },
        },
      }

      ycloud.parseMessage(responseBody)
      expect(ycloud.messageData).toEqual({
        kind: 'text',
        waId: 'message-id',
        text: { body: 'Button Text' },
      })
    })

    it('should parse order message correctly', () => {
      const responseBody = {
        whatsappInboundMessage: {
          id: 'message-id',
          type: 'order',
          order: {
            catalog_id: 'catalog-123',
            text: 'Order text',
            product_items: [{ product_retailer_id: 'prod-1', quantity: 2 }],
          },
        },
      }

      ycloud.parseMessage(responseBody)
      expect(ycloud.messageData).toEqual({
        kind: 'order',
        waId: 'message-id',
        order: {
          catalogId: 'catalog-123',
          text: 'Order text',
          productItems: [{ product_retailer_id: 'prod-1', quantity: 2 }],
        },
      })
    })

    it('should parse image message correctly', () => {
      const responseBody = {
        whatsappInboundMessage: {
          id: 'message-id',
          type: 'image',
          image: {
            id: 'image-id',
            link: 'https://example.com/image.jpg',
            sha256: 'image-hash',
            caption: 'Image caption',
          },
        },
      }

      ycloud.parseMessage(responseBody)
      expect(ycloud.messageData).toEqual({
        kind: 'file',
        waId: 'message-id',
        file: {
          id: 'image-id',
          url: 'https://example.com/image.jpg',
          fileName: 'image-hash',
          caption: 'Image caption',
          fileBase64: null,
        },
      })
    })

    it('should parse video message correctly', () => {
      const responseBody = {
        whatsappInboundMessage: {
          id: 'message-id',
          type: 'video',
          video: {
            id: 'video-id',
            link: 'https://example.com/video.mp4',
            sha256: 'video-hash',
            caption: 'Video caption',
          },
        },
      }

      ycloud.parseMessage(responseBody)
      expect(ycloud.messageData).toEqual({
        kind: 'file',
        waId: 'message-id',
        file: {
          id: 'video-id',
          url: 'https://example.com/video.mp4',
          fileName: 'video-hash',
          caption: 'Video caption',
          fileBase64: null,
        },
      })
    })

    it('should parse voice message correctly', () => {
      const responseBody = {
        whatsappInboundMessage: {
          id: 'message-id',
          type: 'voice',
          voice: {
            id: 'voice-id',
            link: 'https://example.com/voice.opus',
            sha256: 'voice-hash',
            caption: 'Voice caption',
          },
        },
      }

      ycloud.parseMessage(responseBody)
      expect(ycloud.messageData).toEqual({
        kind: 'file',
        waId: 'message-id',
        file: {
          id: 'voice-id',
          url: 'https://example.com/voice.opus',
          fileName: 'voice-hash',
          caption: 'Voice caption',
          fileBase64: null,
        },
      })
    })

    it('should parse audio message correctly', () => {
      const responseBody = {
        whatsappInboundMessage: {
          id: 'message-id',
          type: 'audio',
          audio: {
            id: 'audio-id',
            link: 'https://example.com/audio.mp3',
            sha256: 'audio-hash',
            caption: 'Audio caption',
          },
        },
      }

      ycloud.parseMessage(responseBody)
      expect(ycloud.messageData).toEqual({
        kind: 'file',
        waId: 'message-id',
        file: {
          id: 'audio-id',
          url: 'https://example.com/audio.mp3',
          fileName: 'audio-hash',
          caption: 'Audio caption',
          fileBase64: null,
        },
      })
    })

    it('should parse document message correctly', () => {
      const responseBody = {
        whatsappInboundMessage: {
          id: 'message-id',
          type: 'document',
          document: {
            id: 'doc-id',
            link: 'https://example.com/document.pdf',
            filename: 'document.pdf',
            caption: 'Document caption',
          },
        },
      }

      ycloud.parseMessage(responseBody)
      expect(ycloud.messageData).toEqual({
        kind: 'file',
        waId: 'message-id',
        file: {
          id: 'doc-id',
          url: 'https://example.com/document.pdf',
          fileName: 'document.pdf',
          caption: 'Document caption',
          fileBase64: null,
        },
      })
    })

    it('should parse location message correctly', () => {
      const responseBody = {
        whatsappInboundMessage: {
          id: 'message-id',
          type: 'location',
          location: {
            latitude: -23.5505,
            longitude: -46.6333,
            name: 'São Paulo',
            address: 'São Paulo, SP, Brazil',
          },
        },
      }

      ycloud.parseMessage(responseBody)
      expect(ycloud.messageData).toEqual({
        kind: 'location',
        waId: 'message-id',
        latitude: -23.5505,
        longitude: -46.6333,
        name: 'São Paulo',
        address: 'São Paulo, SP, Brazil',
      })
    })

    it('should handle missing whatsappInboundMessage', () => {
      const responseBody = {}
      ycloud.parseMessage(responseBody)
      expect(ycloud.messageData).toBeNull()
    })

    it('should skip unsupported message types', () => {
      const unsupportedTypes = ['sticker', 'ephemeral', 'reaction', 'contacts', 'unsupported', 'system', 'interactive']

      unsupportedTypes.forEach((type) => {
        const responseBody = {
          whatsappInboundMessage: {
            id: 'message-id',
            type: type,
          },
        }

        ycloud.parseMessage(responseBody)
        expect(ycloud.messageData).toBeNull()
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
        whatsappInboundMessage: {
          from: '5511999999999',
          customerProfile: {
            name: 'John Doe',
          },
        },
      }

      ycloud.parseContactData(responseBody)
      expect(ycloud.contactData).toEqual({
        number: '5511999999999',
        type: '@c.us',
        name: 'John Doe',
        wa_start_chat: expect.any(Date),
      })
    })

    it('should handle missing whatsappInboundMessage', () => {
      const responseBody = {}
      ycloud.parseContactData(responseBody)
      expect(ycloud.contactData).toBeNull()
    })

    it('should handle missing customerProfile', () => {
      const mockNormalizePhone = {
        number: '5511999999999',
        type: '@c.us',
      }
      NormalizePhone.mockImplementation(() => mockNormalizePhone)

      const responseBody = {
        whatsappInboundMessage: {
          from: '5511999999999',
        },
      }

      ycloud.parseContactData(responseBody)
      expect(ycloud.contactData).toEqual({
        number: '5511999999999',
        type: '@c.us',
        name: '',
        wa_start_chat: expect.any(Date),
      })
    })
  })

  describe('contactWithDifferentData', () => {
    it('should return true when contact name is different', () => {
      ycloud.contactData = {
        name: 'New Name',
        waId: 'wa-id-123',
      }

      const contact = {
        name: 'Old Name',
        waId: 'wa-id-123',
      }

      expect(ycloud.contactWithDifferentData(contact)).toBe(true)
    })

    it('should return true when contact waId is different', () => {
      ycloud.contactData = {
        name: 'Same Name',
        waId: 'new-wa-id',
      }

      const contact = {
        name: 'Same Name',
        waId: 'old-wa-id',
      }

      expect(ycloud.contactWithDifferentData(contact)).toBe(true)
    })

    it('should return false when contact data is the same', () => {
      ycloud.contactData = {
        name: 'Same Name',
        waId: 'same-wa-id',
      }

      const contact = {
        name: 'Same Name',
        waId: 'same-wa-id',
      }

      expect(ycloud.contactWithDifferentData(contact)).toBe(false)
    })
  })

  describe('shouldUpdateWaStartChat', () => {
    it('should return true when contact has no wa_start_chat', () => {
      const contact = {}
      expect(ycloud.shouldUpdateWaStartChat(contact)).toBe(true)
    })

    it('should return false when contact has wa_start_chat', () => {
      const contact = { wa_start_chat: new Date() }
      expect(ycloud.shouldUpdateWaStartChat(contact)).toBe(false)
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
        data: { id: 'sent-message-id' },
      })

      await ycloud.sendMessage('message-id', 'https://api.ycloud.com/v1', 'test-token')

      expect(request.post).toHaveBeenCalledWith('https://api.ycloud.com/v1/whatsapp/messages/sendDirectly', {
        headers: {
          'X-Api-Key': 'test-token',
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: {
          from: '+5511999999999',
          to: '+5511999999999',
          type: 'text',
          text: {
            body: 'Hello World',
          },
        },
      })

      expect(mockMessage.sended).toBe(true)
      expect(mockMessage.messageWaId).toBe('sent-message-id')
      expect(mockMessage.save).toHaveBeenCalled()
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
        data: { id: 'sent-message-id' },
      })

      await ycloud.sendMessage('message-id', 'https://api.ycloud.com/v1', 'test-token')

      expect(request.post).toHaveBeenCalledWith('https://api.ycloud.com/v1/whatsapp/messages/sendDirectly', {
        headers: {
          'X-Api-Key': 'test-token',
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: {
          from: '+5511999999999',
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
        data: { id: 'sent-message-id' },
      })

      await ycloud.sendMessage('message-id', 'https://api.ycloud.com/v1', 'test-token')

      expect(request.post).toHaveBeenCalledWith('https://api.ycloud.com/v1/whatsapp/messages/sendDirectly', {
        headers: {
          'X-Api-Key': 'test-token',
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: {
          from: '+5511999999999',
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

    it('should send image file message successfully', async () => {
      files.isPhoto.mockReturnValue(true)
      files.isVideo.mockReturnValue(false)
      files.isMidia.mockReturnValue(false)
      files.isVoice.mockReturnValue(false)

      mockMessage.kind = 'file'
      mockMessage.url = 'https://example.com/image.jpg'
      mockMessage.fileName = 'image.jpg'

      request.post.mockResolvedValue({
        status: 200,
        data: { id: 'sent-message-id' },
      })

      await ycloud.sendMessage('message-id', 'https://api.ycloud.com/v1', 'test-token')

      expect(request.post).toHaveBeenCalledWith('https://api.ycloud.com/v1/whatsapp/messages/sendDirectly', {
        headers: {
          'X-Api-Key': 'test-token',
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: {
          from: '+5511999999999',
          to: '+5511999999999',
          type: 'image',
          image: {
            link: 'https://example.com/image.jpg',
          },
        },
      })
    })

    it('should send location message successfully', async () => {
      mockMessage.kind = 'location'
      mockMessage.latitude = -23.5505
      mockMessage.longitude = -46.6333

      request.post.mockResolvedValue({
        status: 200,
        data: { id: 'sent-message-id' },
      })

      await ycloud.sendMessage('message-id', 'https://api.ycloud.com/v1', 'test-token')

      expect(request.post).toHaveBeenCalledWith('https://api.ycloud.com/v1/whatsapp/messages/sendDirectly', {
        headers: {
          'X-Api-Key': 'test-token',
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: {
          from: '+5511999999999',
          to: '+5511999999999',
          type: 'location',
          location: {
            longitude: -46.6333,
            latitude: -23.5505,
          },
        },
      })
    })

    it('should handle send message error', async () => {
      request.post.mockResolvedValue({
        status: 400,
        data: { error: 'Bad Request' },
      })

      await ycloud.sendMessage('message-id', 'https://api.ycloud.com/v1', 'test-token')

      expect(mockMessage.error).toBe('{"error":"Bad Request"}')
      expect(mockMessage.save).toHaveBeenCalled()
    })

    it('should handle network error', async () => {
      const error = new Error('Network Error')
      error.response = { data: { error: 'Network Error' } }
      request.post.mockRejectedValue(error)

      await ycloud.sendMessage('message-id', 'https://api.ycloud.com/v1', 'test-token')

      expect(mockMessage.error).toBe('{"error":"Network Error"}')
      expect(mockMessage.save).toHaveBeenCalled()
    })
  })

  describe('setWebhook', () => {
    it('should set webhook successfully', async () => {
      request.post.mockResolvedValue({
        status: 200,
        data: { success: true },
      })

      const result = await ycloud.setWebhook('https://api.ycloud.com/v1', 'test-token')

      expect(request.post).toHaveBeenCalledWith('https://api.ycloud.com/v1/webhookEndpoints', {
        headers: {
          'X-Api-Key': 'test-token',
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: {
          url: 'https://example.com/webhook',
          events: ['whatsapp.inbound_message.received'],
        },
      })

      expect(result).toBe(true)
    })

    it('should handle webhook error', async () => {
      request.post.mockRejectedValue(new Error('Webhook Error'))

      const result = await ycloud.setWebhook('https://api.ycloud.com/v1', 'test-token')

      expect(result).toBe(false)
    })
  })

  describe('searchTemplates', () => {
    it('should search templates successfully', async () => {
      const mockYCloudTemplates = {
        items: [
          {
            name: 'welcome_template',
            language: 'pt_BR',
            status: 'APPROVED',
            category: 'UTILITY',
            officialTemplateId: 'template-123',
            wabaId: 'waba-123',
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
        ],
      }

      request.get.mockResolvedValue({
        status: 200,
        data: mockYCloudTemplates,
      })

      const result = await ycloud.searchTemplates('https://api.ycloud.com/v1', 'test-token')

      expect(request.get).toHaveBeenCalledWith(
        'https://api.ycloud.com/v1/whatsapp/templates?page=1&limit=50&includeTotal=false',
        {
          headers: {
            'X-Api-Key': 'test-token',
            accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      )

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        name: 'welcome_template',
        licensee: '507f1f77bcf86cd799439011',
        language: 'pt_BR',
        active: true,
        category: 'UTILITY',
        officialTemplateId: 'template-123',
        wabaId: 'waba-123',
        headerParams: [{ format: 'IMAGE' }],
        bodyParams: [{ number: '1', format: 'text' }],
        footerParams: [],
      })
    })

    it('should handle template search error', async () => {
      request.get.mockRejectedValue(new Error('Template Error'))

      const result = await ycloud.searchTemplates('https://api.ycloud.com/v1', 'test-token')

      expect(result).toEqual([])
    })
  })
})
