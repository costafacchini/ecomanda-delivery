import Landbot from './Landbot'
import Trigger from '@models/Trigger'
import fetchMock from 'fetch-mock'
import mongoServer from '../../../../.jest/utils'
import emoji from '@helpers/Emoji'
import Room from '@models/Room'
import { licensee as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { room as roomFactory } from '@factories/room'
import { message as messageFactory } from '@factories/message'
import { triggerReplyButton as triggerReplyButtonFactory } from '@factories/trigger'
import { cart as cartFactory } from '@factories/cart'
import { advanceTo, clear } from 'jest-date-mock'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { ContactRepositoryDatabase } from '@repositories/contact'
import { CartRepositoryDatabase } from '@repositories/cart'
import { MessageRepositoryDatabase } from '@repositories/message'

jest.mock('uuid', () => ({ v4: () => '150bdb15-4c55-42ac-bc6c-970d620fdb6d' }))

describe('Landbot plugin', () => {
  let licensee
  const consoleInfoSpy = jest.spyOn(global.console, 'info').mockImplementation()
  const consoleErrorSpy = jest.spyOn(global.console, 'error').mockImplementation()
  const emojiReplaceSpy = jest.spyOn(emoji, 'replace')

  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
    fetchMock.reset()

    const licenseeRepository = new LicenseeRepositoryDatabase()
    licensee = await licenseeRepository.create(licenseeFactory.build())
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#responseToMessages', () => {
    it('returns the response body transformed in messages', async () => {
      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(
        contactFactory.build({
          talkingWithChatBot: true,
          licensee,
        }),
      )

      const triggerOrder2 = await Trigger.create(triggerReplyButtonFactory.build({ licensee, order: 2 }))
      const trigger = await Trigger.create(triggerReplyButtonFactory.build({ licensee }))

      const responseBody = {
        messages: [
          {
            type: 'text',
            timestamp: '1234567890',
            message: 'Hello world',
          },
          {
            type: 'image',
            timestamp: '1234567890',
            url: 'https://octodex.github.com/images/dojocat.jpg',
            message: 'Text with image',
          },
          {
            type: 'multiple_images',
            timestamp: '1234567890',
            urls: [
              'https://octodex.github.com/images/dojocat.jpg',
              'https://www.helloumi.com/wp-content/uploads/2016/07/logo-helloumi-web.png',
            ],
            message: 'Hello',
          },
          {
            type: 'location',
            timestamp: '1234567890',
            latitude: 3.15,
            longitude: 101.75,
            message: 'It is here',
          },
          {
            type: 'text',
            timestamp: '1234567347',
            message: 'send_reply_buttons',
          },
          {
            type: 'dialog',
            timestamp: '1234567890',
            title: 'Hi there',
            buttons: ['Hey', 'Bye'],
            payloads: ['$0', '$1'],
          },
        ],
        customer: {
          id: 2000,
          name: 'John',
          number: '5511990283745',
        },
        agent: {
          id: 1,
          type: 'human',
        },
        channel: {
          id: 100,
          name: 'Android App',
        },
      }

      const landbot = new Landbot(licensee)
      const messages = await landbot.responseToMessages(responseBody)

      expect(messages.length).toEqual(5)

      expect(messages[0].licensee).toEqual(licensee._id)
      expect(messages[0].contact).toEqual(contact._id)
      expect(messages[0].kind).toEqual('text')
      expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
      expect(messages[0].destination).toEqual('to-messenger')
      expect(messages[0].text).toEqual('Hello world')
      expect(messages[0].url).toEqual(undefined)
      expect(messages[0].fileName).toEqual(undefined)
      expect(messages[0].latitude).toEqual(undefined)
      expect(messages[0].longitude).toEqual(undefined)
      expect(messages[0].departament).toEqual(undefined)

      expect(messages[1].licensee).toEqual(licensee._id)
      expect(messages[1].contact).toEqual(contact._id)
      expect(messages[1].kind).toEqual('file')
      expect(messages[1].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
      expect(messages[1].destination).toEqual('to-messenger')
      expect(messages[1].text).toEqual('Text with image')
      expect(messages[1].url).toEqual('https://octodex.github.com/images/dojocat.jpg')
      expect(messages[1].fileName).toEqual('dojocat.jpg')
      expect(messages[1].latitude).toEqual(undefined)
      expect(messages[1].longitude).toEqual(undefined)
      expect(messages[1].departament).toEqual(undefined)

      expect(messages[2].licensee).toEqual(licensee._id)
      expect(messages[2].contact).toEqual(contact._id)
      expect(messages[2].kind).toEqual('location')
      expect(messages[2].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
      expect(messages[2].destination).toEqual('to-messenger')
      expect(messages[2].text).toEqual('It is here')
      expect(messages[2].url).toEqual(undefined)
      expect(messages[2].fileName).toEqual(undefined)
      expect(messages[2].latitude).toEqual(3.15)
      expect(messages[2].longitude).toEqual(101.75)
      expect(messages[2].departament).toEqual(undefined)

      expect(messages[3].licensee).toEqual(licensee._id)
      expect(messages[3].contact).toEqual(contact._id)
      expect(messages[3].kind).toEqual('interactive')
      expect(messages[3].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
      expect(messages[3].destination).toEqual('to-messenger')
      expect(messages[3].text).toEqual('send_reply_buttons')
      expect(messages[3].trigger).toEqual(trigger._id)
      expect(messages[3].url).toEqual(undefined)
      expect(messages[3].fileName).toEqual(undefined)
      expect(messages[3].latitude).toEqual(undefined)
      expect(messages[3].longitude).toEqual(undefined)
      expect(messages[3].departament).toEqual(undefined)

      expect(messages[4].licensee).toEqual(licensee._id)
      expect(messages[4].contact).toEqual(contact._id)
      expect(messages[4].kind).toEqual('interactive')
      expect(messages[4].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
      expect(messages[4].destination).toEqual('to-messenger')
      expect(messages[4].text).toEqual('send_reply_buttons')
      expect(messages[4].trigger).toEqual(triggerOrder2._id)
      expect(messages[4].url).toEqual(undefined)
      expect(messages[4].fileName).toEqual(undefined)
      expect(messages[4].latitude).toEqual(undefined)
      expect(messages[4].longitude).toEqual(undefined)
      expect(messages[4].departament).toEqual(undefined)

      expect(emojiReplaceSpy).toHaveBeenCalledTimes(4)
      expect(emojiReplaceSpy).toHaveBeenCalledWith('Hello world')
      expect(emojiReplaceSpy).toHaveBeenCalledWith('Text with image')
      expect(emojiReplaceSpy).toHaveBeenCalledWith('It is here')
      expect(emojiReplaceSpy).toHaveBeenCalledWith('send_reply_buttons')

      expect(consoleInfoSpy).toHaveBeenCalledTimes(2)
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        'Tipo de mensagem retornado pela Landbot não reconhecido: multiple_images',
      )
      expect(consoleInfoSpy).toHaveBeenCalledWith('Tipo de mensagem retornado pela Landbot não reconhecido: dialog')
    })

    it('changes the landbotId in contact if is different', async () => {
      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(
        contactFactory.build({
          talkingWithChatBot: true,
          landbotId: '123',
          licensee,
        }),
      )

      const responseBody = {
        messages: [
          {
            type: 'text',
            timestamp: '1234567890',
            message: 'Hello world',
          },
        ],
        customer: {
          id: 2000,
          name: 'John',
          number: '5511990283745',
        },
        agent: {
          id: 1,
          type: 'human',
        },
        channel: {
          id: 100,
          name: 'Android App',
        },
      }

      const landbot = new Landbot(licensee)
      await landbot.responseToMessages(responseBody)

      const contactUpdated = await contactRepository.findFirst({ _id: contact._id })
      expect(contactUpdated.landbotId).toEqual('2000')
    })

    it('return the empty array if body is blank', async () => {
      const responseBody = {}

      const landbot = new Landbot(licensee)
      const messages = await landbot.responseToMessages(responseBody)

      expect(messages.length).toEqual(0)
    })

    it('return the empty array if contact does not exists', async () => {
      const responseBody = {
        messages: [
          {
            type: 'text',
            timestamp: '1234567890',
            message: 'Hello world',
          },
          {
            type: 'image',
            timestamp: '1234567890',
            url: 'https://octodex.github.com/images/dojocat.jpg',
            message: 'Text with image',
          },
          {
            type: 'multiple_images',
            timestamp: '1234567890',
            urls: [
              'https://octodex.github.com/images/dojocat.jpg',
              'https://www.helloumi.com/wp-content/uploads/2016/07/logo-helloumi-web.png',
            ],
            message: 'Hello',
          },
          {
            type: 'location',
            timestamp: '1234567890',
            latitude: 3.15,
            longitude: 101.75,
            message: 'It is here',
          },
          {
            type: 'text',
            timestamp: '1234567347',
            message: 'send_reply_buttons',
          },
          {
            type: 'dialog',
            timestamp: '1234567890',
            title: 'Hi there',
            buttons: ['Hey', 'Bye'],
            payloads: ['$0', '$1'],
          },
        ],
        customer: {
          id: 2000,
          name: 'John',
          number: '5511990283745',
        },
        agent: {
          id: 1,
          type: 'human',
        },
        channel: {
          id: 100,
          name: 'Android App',
        },
      }

      const landbot = new Landbot(licensee)
      const messages = await landbot.responseToMessages(responseBody)

      expect(messages.length).toEqual(0)

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1)
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        `Contato com telefone 5511990283745 e licenciado ${licensee._id} não encontrado`,
      )
    })

    it('return the empty array if body does not have a customer', async () => {
      const responseBody = {
        messages: [
          {
            message: 'text',
          },
        ],
      }

      const landbot = new Landbot(licensee)
      const messages = await landbot.responseToMessages(responseBody)

      expect(messages.length).toEqual(0)
    })

    it('return the empty array if body does not have messages', async () => {
      const responseBody = {
        customer: {
          name: 'John Doe',
        },
      }

      const landbot = new Landbot(licensee)
      const messages = await landbot.responseToMessages(responseBody)

      expect(messages.length).toEqual(0)
    })

    it('return the empty array if message type is text and message is blank', async () => {
      const responseBody = {
        messages: [
          {
            type: 'text',
            timestamp: '1234567890',
            message: null,
          },
        ],
        customer: {
          id: 2000,
          name: 'John',
          number: '5511990283745',
        },
        agent: {
          id: 1,
          type: 'human',
        },
        channel: {
          id: 100,
          name: 'Android App',
        },
      }

      const landbot = new Landbot(licensee)
      const messages = await landbot.responseToMessages(responseBody)

      expect(messages.length).toEqual(0)
    })
  })

  describe('#responseTransferToMessage', () => {
    it('returns the response body transformed in message', async () => {
      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(
        contactFactory.build({
          talkingWithChatBot: true,
          licensee,
        }),
      )

      const responseBody = {
        number: '5511990283745@c.us',
        observacao: 'Message to send chat',
        id_departamento_rocketchat: '100',
      }

      const landbot = new Landbot(licensee)
      const message = await landbot.responseTransferToMessage(responseBody)

      expect(message.licensee).toEqual(licensee._id)
      expect(message.contact).toEqual(contact._id)
      expect(message.kind).toEqual('text')
      expect(message.number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
      expect(message.destination).toEqual('to-transfer')
      expect(message.text).toEqual('Message to send chat')
      expect(message.departament).toEqual('100')
      expect(message.url).toEqual(undefined)
      expect(message.fileName).toEqual(undefined)
      expect(message.latitude).toEqual(undefined)
      expect(message.longitude).toEqual(undefined)
    })

    it('return the empty message if number is blank', async () => {
      const responseBody = {
        observacao: 'Message to send chat',
        id_departamento_rocketchat: '100',
      }

      const landbot = new Landbot(licensee)
      const message = await landbot.responseTransferToMessage(responseBody)

      expect(message).toEqual(undefined)
    })

    it('return the empty message if contact is not exists', async () => {
      const responseBody = {
        number: '5511990283745@c.us',
        observacao: 'Message to send chat',
        id_departamento_rocketchat: '100',
      }

      const landbot = new Landbot(licensee)
      const message = await landbot.responseTransferToMessage(responseBody)

      expect(message).toEqual(undefined)

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1)
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        `Contato com telefone 5511990283745 e licenciado ${licensee._id} não encontrado`,
      )
    })

    it('close room if the body has a iniciar_nova_conversa with true', async () => {
      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(
        contactFactory.build({
          talkingWithChatBot: true,
          licensee,
        }),
      )

      const room = await Room.create(
        roomFactory.build({
          contact,
        }),
      )

      const responseBody = {
        number: '5511990283745@c.us',
        observacao: 'Message to send chat',
        id_departamento_rocketchat: '100',
        iniciar_nova_conversa: 'true',
      }

      const landbot = new Landbot(licensee)
      await landbot.responseTransferToMessage(responseBody)

      const modifiedRoom = await Room.findById(room._id)
      expect(modifiedRoom.roomId).toEqual('ka3DiV9CuHD765')
      expect(modifiedRoom.closed).toEqual(true)
    })

    it('updates the contact name when name is different of the contact name', async () => {
      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(
        contactFactory.build({
          talkingWithChatBot: true,
          licensee,
        }),
      )

      const responseBody = {
        name: 'John Silver Doe',
        number: '5511990283745@c.us',
        observacao: 'Message to send chat',
        id_departamento_rocketchat: '100',
      }

      const landbot = new Landbot(licensee)
      await landbot.responseTransferToMessage(responseBody)

      const modifiedContact = await contactRepository.findFirst({ _id: contact._id })
      expect(modifiedContact.name).toEqual('John Silver Doe')
    })

    it('updates the contact email when email is different of the contact email', async () => {
      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(
        contactFactory.build({
          talkingWithChatBot: true,
          licensee,
          email: 'john@doe.com',
        }),
      )

      const responseBody = {
        email: 'john_silver@doe.com',
        number: '5511990283745@c.us',
        observacao: 'Message to send chat',
        id_departamento_rocketchat: '100',
      }

      const landbot = new Landbot(licensee)
      await landbot.responseTransferToMessage(responseBody)

      const modifiedContact = await contactRepository.findFirst({ _id: contact._id })
      expect(modifiedContact.email).toEqual('john_silver@doe.com')
    })
  })

  describe('#sendMessage', () => {
    describe('when response status is 201', () => {
      it('marks the message with sended', async () => {
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
            text: 'Message to send',
            contact,
            licensee,
            sended: false,
          }),
        )

        const expectedBody = {
          customer: {
            name: 'John Doe',
            number: '5511990283745',
            type: '@c.us',
            licensee: licensee._id,
          },
          message: {
            type: 'text',
            message: 'Message to send',
            payload: '$1',
          },
        }

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://url.com.br/5511990283745/' &&
              body === JSON.stringify(expectedBody) &&
              headers['Authorization'] === 'Token token'
            )
          },
          {
            status: 201,
            body: {
              success: true,
              customer: {
                id: 42,
                name: 'John Doe',
                phone: '5511990283745@c.us',
                token: 'token',
              },
            },
          },
        )

        expect(message.sended).toEqual(false)

        const landbot = new Landbot(licensee)
        await landbot.sendMessage(message._id, 'https://url.com.br', 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        const messageUpdated = await messageRepository.findFirst({ _id: message._id })
        expect(messageUpdated.sended).toEqual(true)
      })

      it('logs the success message', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: true,
            email: 'john@doe.com',
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

        fetchMock.postOnce('https://url.com.br/5511990283745/', {
          status: 201,
          body: {
            success: true,
            customer: {
              id: 42,
              name: 'John Doe',
              phone: '5511990283745@c.us',
              email: 'john@doe.com',
              token: 'token',
            },
          },
        })

        const landbot = new Landbot(licensee)
        await landbot.sendMessage(message._id, 'https://url.com.br', 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleInfoSpy).toHaveBeenCalledWith(
          `Mensagem 60958703f415ed4008748637 enviada para Landbot com sucesso!
           status: 201
           body: ${JSON.stringify({
             success: true,
             customer: {
               id: 42,
               name: 'John Doe',
               phone: '5511990283745@c.us',
               email: 'john@doe.com',
               token: 'token',
             },
           })}`,
        )
      })

      describe('when the message is cart', () => {
        it('sends the message with cart parsed in body', async () => {
          advanceTo(new Date('2021-01-05T10:25:47.000Z'))

          licensee.cartDefault = 'go2go'

          const contactRepository = new ContactRepositoryDatabase()
          const contact = await contactRepository.create(
            contactFactory.build({
              name: 'John Doe',
              talkingWithChatBot: true,
              licensee,
            }),
          )

          const cartRepository = new CartRepositoryDatabase()
          const cart = await cartRepository.create(cartFactory.build({ contact, licensee }))

          const messageRepository = new MessageRepositoryDatabase()
          const message = await messageRepository.create(
            messageFactory.build({
              kind: 'cart',
              contact,
              licensee,
              cart,
              sended: false,
            }),
          )

          const expectedBody = {
            customer: {
              name: 'John Doe',
              number: '5511990283745',
              type: '@c.us',
              licensee: licensee._id,
            },
            message: {
              type: 'text',
              message:
                '{"order":{"origemId":0,"deliveryMode":"MERCHANT","refPedido":"Ecommerce","refOrigem":"Ecommerce","refCurtaOrigem":"","docNotaFiscal":false,"valorDocNotaFiscal":"","nomeCliente":"John Doe","endEntrega":"","dataPedido":"2021-01-05T10:25:47.000Z","subTotal":15.600000000000001,"impostos":0,"voucher":0,"dataEntrega":"2021-01-05T10:25:47.000Z","taxaEntrega":0.5,"totalPedido":16.1,"documento":"","flagIntegrado":"NaoIntegrado","valorPagar":16.1,"telefonePedido":"5511990283745","pagamentos":[{"tipo":"","valor":16.1,"observacao":"","codigoResposta":"","bandeira":0,"troco":0,"nsu":0,"status":"NaoInformado","descontoId":0,"prePago":false,"transactionId":0}],"entrega":{"retiraLoja":false,"data":"","retirada":"Hoje","endereco":{"id":37025,"pais":"Brasil","padrao":false}},"itens":[{"produtoId":"0123","quantidade":2,"precoTotal":7.8,"adicionalPedidoItems":[{"produtoId":"Additional 1","atributoValorId":"Detail 1","quantidade":1,"precoTotal":0.5}]}]}}',
              payload: '$1',
            },
          }

          fetchMock.postOnce(
            (url, { body }) => {
              return url === 'https://url.com.br/5511990283745/' && body === JSON.stringify(expectedBody)
            },
            {
              status: 201,
              body: {
                success: true,
                customer: {
                  id: 42,
                  name: 'John Doe',
                  phone: '5511990283745@c.us',
                  token: 'token',
                },
              },
            },
          )

          expect(message.sended).toEqual(false)

          const landbot = new Landbot(licensee)
          await landbot.sendMessage(message._id, 'https://url.com.br', 'token')
          await fetchMock.flush(true)

          expect(fetchMock.done()).toBe(true)
          expect(fetchMock.calls()).toHaveLength(1)

          const messageUpdated = await messageRepository.findFirst({ _id: message._id })
          expect(messageUpdated.sended).toEqual(true)

          clear()
        })
      })

      describe('when message is location', () => {
        it('sends the message', async () => {
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
              kind: 'location',
              latitude: 1,
              longitude: 2,
              contact,
              licensee,
              sended: false,
            }),
          )

          const expectedBody = {
            customer: {
              name: 'John Doe',
              number: '5511990283745',
              type: '@c.us',
              licensee: licensee._id,
            },
            message: {
              type: 'location',
              latitude: 1,
              longitude: 2,
            },
          }

          fetchMock.postOnce(
            (url, { body, headers }) => {
              return (
                url === 'https://url.com.br/5511990283745/' &&
                body === JSON.stringify(expectedBody) &&
                headers['Authorization'] === 'Token token'
              )
            },
            {
              status: 201,
              body: {
                success: true,
                customer: {
                  id: 42,
                  name: 'John Doe',
                  phone: '5511990283745@c.us',
                  token: 'token',
                },
              },
            },
          )

          expect(message.sended).toEqual(false)

          const landbot = new Landbot(licensee)
          await landbot.sendMessage(message._id, 'https://url.com.br', 'token')
          await fetchMock.flush(true)

          expect(fetchMock.done()).toBe(true)
          expect(fetchMock.calls()).toHaveLength(1)

          const messageUpdated = await messageRepository.findFirst({ _id: message._id })
          expect(messageUpdated.sended).toEqual(true)
        })
      })

      describe('when message is file', () => {
        describe('when is image', () => {
          it('sends the message', async () => {
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
                kind: 'file',
                fileName: 'dojocat.jpg',
                url: 'https://octodex.github.com/images/dojocat.jpg',
                contact,
                licensee,
                sended: false,
              }),
            )

            const expectedBody = {
              customer: {
                name: 'John Doe',
                number: '5511990283745',
                type: '@c.us',
                licensee: licensee._id,
              },
              message: {
                url: 'https://octodex.github.com/images/dojocat.jpg',
                type: 'image',
              },
            }

            fetchMock.postOnce(
              (url, { body, headers }) => {
                return (
                  url === 'https://url.com.br/5511990283745/' &&
                  body === JSON.stringify(expectedBody) &&
                  headers['Authorization'] === 'Token token'
                )
              },
              {
                status: 201,
                body: {
                  success: true,
                  customer: {
                    id: 42,
                    name: 'John Doe',
                    phone: '5511990283745@c.us',
                    token: 'token',
                  },
                },
              },
            )

            expect(message.sended).toEqual(false)

            const landbot = new Landbot(licensee)
            await landbot.sendMessage(message._id, 'https://url.com.br', 'token')
            await fetchMock.flush(true)

            expect(fetchMock.done()).toBe(true)
            expect(fetchMock.calls()).toHaveLength(1)

            const messageUpdated = await messageRepository.findFirst({ _id: message._id })
            expect(messageUpdated.sended).toEqual(true)
          })
        })

        describe('when is video', () => {
          it('sends the message', async () => {
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
                kind: 'file',
                fileName: 'dojocat.mp4',
                url: 'https://octodex.github.com/images/dojocat.mp4',
                contact,
                licensee,
                sended: false,
              }),
            )

            const expectedBody = {
              customer: {
                name: 'John Doe',
                number: '5511990283745',
                type: '@c.us',
                licensee: licensee._id,
              },
              message: {
                url: 'https://octodex.github.com/images/dojocat.mp4',
                type: 'video',
              },
            }

            fetchMock.postOnce(
              (url, { body, headers }) => {
                return (
                  url === 'https://url.com.br/5511990283745/' &&
                  body === JSON.stringify(expectedBody) &&
                  headers['Authorization'] === 'Token token'
                )
              },
              {
                status: 201,
                body: {
                  success: true,
                  customer: {
                    id: 42,
                    name: 'John Doe',
                    phone: '5511990283745@c.us',
                    token: 'token',
                  },
                },
              },
            )

            expect(message.sended).toEqual(false)

            const landbot = new Landbot(licensee)
            await landbot.sendMessage(message._id, 'https://url.com.br', 'token')
            await fetchMock.flush(true)

            expect(fetchMock.done()).toBe(true)
            expect(fetchMock.calls()).toHaveLength(1)

            const messageUpdated = await messageRepository.findFirst({ _id: message._id })
            expect(messageUpdated.sended).toEqual(true)
          })
        })

        describe('when is audio', () => {
          it('sends the message', async () => {
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
                kind: 'file',
                fileName: 'dojocat.ogg',
                url: 'https://octodex.github.com/images/dojocat.ogg',
                contact,
                licensee,
                sended: false,
              }),
            )

            const expectedBody = {
              customer: {
                name: 'John Doe',
                number: '5511990283745',
                type: '@c.us',
                licensee: licensee._id,
              },
              message: {
                url: 'https://octodex.github.com/images/dojocat.ogg',
                type: 'audio',
              },
            }

            fetchMock.postOnce(
              (url, { body, headers }) => {
                return (
                  url === 'https://url.com.br/5511990283745/' &&
                  body === JSON.stringify(expectedBody) &&
                  headers['Authorization'] === 'Token token'
                )
              },
              {
                status: 201,
                body: {
                  success: true,
                  customer: {
                    id: 42,
                    name: 'John Doe',
                    phone: '5511990283745@c.us',
                    token: 'token',
                  },
                },
              },
            )

            expect(message.sended).toEqual(false)

            const landbot = new Landbot(licensee)
            await landbot.sendMessage(message._id, 'https://url.com.br', 'token')
            await fetchMock.flush(true)

            expect(fetchMock.done()).toBe(true)
            expect(fetchMock.calls()).toHaveLength(1)

            const messageUpdated = await messageRepository.findFirst({ _id: message._id })
            expect(messageUpdated.sended).toEqual(true)
          })
        })

        describe('when is document', () => {
          it('sends the message', async () => {
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
                kind: 'file',
                fileName: 'dojocat.pdf',
                url: 'https://octodex.github.com/images/dojocat.pdf',
                contact,
                licensee,
                sended: false,
              }),
            )

            const expectedBody = {
              customer: {
                name: 'John Doe',
                number: '5511990283745',
                type: '@c.us',
                licensee: licensee._id,
              },
              message: {
                url: 'https://octodex.github.com/images/dojocat.pdf',
                type: 'document',
              },
            }

            fetchMock.postOnce(
              (url, { body, headers }) => {
                return (
                  url === 'https://url.com.br/5511990283745/' &&
                  body === JSON.stringify(expectedBody) &&
                  headers['Authorization'] === 'Token token'
                )
              },
              {
                status: 201,
                body: {
                  success: true,
                  customer: {
                    id: 42,
                    name: 'John Doe',
                    phone: '5511990283745@c.us',
                    token: 'token',
                  },
                },
              },
            )

            expect(message.sended).toEqual(false)

            const landbot = new Landbot(licensee)
            await landbot.sendMessage(message._id, 'https://url.com.br', 'token')
            await fetchMock.flush(true)

            expect(fetchMock.done()).toBe(true)
            expect(fetchMock.calls()).toHaveLength(1)

            const messageUpdated = await messageRepository.findFirst({ _id: message._id })
            expect(messageUpdated.sended).toEqual(true)
          })
        })
      })
    })

    describe('when response is not 201', () => {
      it('logs the error message', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            email: 'john@doe.com',
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

        fetchMock.postOnce('https://url.com.br/5511990283745/', {
          status: 403,
          body: {
            detail: 'invalid token',
          },
        })

        expect(message.sended).toEqual(false)

        const landbot = new Landbot(licensee)
        await landbot.sendMessage(message._id, 'https://url.com.br', 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        const messageUpdated = await messageRepository.findFirst({ _id: message._id })
        expect(messageUpdated.sended).toEqual(false)
        expect(messageUpdated.error).toEqual('{"detail":"invalid token"}')

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          `Mensagem 60958703f415ed4008748637 não enviada para Landbot.
           status: 403
           mensagem: ${JSON.stringify({ detail: 'invalid token' })}`,
        )
      })
    })
  })

  describe('.kindToMessageKind', () => {
    it('returns text if kind is text', () => {
      expect(Landbot.kindToMessageKind('text')).toEqual('text')
    })

    it('returns file if kind is document', () => {
      expect(Landbot.kindToMessageKind('document')).toEqual('file')
    })

    it('returns file if kind is image', () => {
      expect(Landbot.kindToMessageKind('image')).toEqual('file')
    })

    it('returns location if kind is location', () => {
      expect(Landbot.kindToMessageKind('location')).toEqual('location')
    })
  })

  describe('#dropConversation', () => {
    it('send request to delete customer on landbot', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(
        licenseeFactory.build({
          chatbotApiToken: 'token',
        }),
      )

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(
        contactFactory.build({
          name: 'John Doe',
          talkingWithChatBot: true,
          licensee,
          landbotId: '20000',
        }),
      )

      fetchMock.deleteOnce((url, { headers }) => {
        return url === 'https://api.landbot.io/v1/customers/20000/' && headers['Authorization'] === 'Token token'
      }, 204)

      const landbot = new Landbot(licensee)
      await landbot.dropConversation(contact._id, 'token')
      await fetchMock.flush(true)

      expect(fetchMock.done()).toBe(true)
      expect(fetchMock.calls()).toHaveLength(1)
    })
  })
})
