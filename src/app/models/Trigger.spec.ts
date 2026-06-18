import Trigger from '@models/Trigger'
import mongoServer from '../../../.jest/utils'
import { licensee as licenseeFactory } from '@factories/licensee'
import { triggerMultiProduct as triggerFactory } from '@factories/trigger'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'

describe('Trigger', () => {
  let licensee

  beforeEach(async () => {
    await mongoServer.connect()

    const licenseeRepository = new LicenseeRepositoryDatabase()
    licensee = await licenseeRepository.create(licenseeFactory.build())
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('before save', () => {
    it('generates _id', async () => {
      const trigger = await Trigger.create(triggerFactory.build({ licensee }))

      expect(trigger._id).not.toEqual(null)
    })

    it('does not changes _id if trigger is changed', async () => {
      const trigger = await Trigger.create(triggerFactory.build({ licensee }))

      trigger.talkingWithChatBot = true
      const alteredTrigger = await trigger.save()

      expect(trigger._id).toEqual(alteredTrigger._id)
      expect(alteredTrigger.talkingWithChatBot).toEqual(true)
    })

    it('fills the fields that have a default value', () => {
      const trigger = new Trigger()

      expect(trigger.order).toEqual(1)
    })
  })

  describe('validations', () => {
    describe('expression', () => {
      it('is required', async () => {
        const trigger = new Trigger({ name: 'Trigger' })
        const validation = await trigger.validate().catch((e: any) => e)

        expect(validation.errors['expression'].message).toEqual('Expressão: Você deve preencher o campo')
      })
    })

    describe('licensee', () => {
      it('is required', async () => {
        const trigger = new Trigger({ number: '7849342387' })
        const validation = await trigger.validate().catch((e: any) => e)

        expect(validation.errors['licensee'].message).toEqual('Licensee: Você deve preencher o campo')
      })
    })

    describe('catalogMulti', () => {
      it('is not required if triggerKind is not multi_product', async () => {
        const trigger = new Trigger({ triggerKind: 'single_product', catalogMulti: '' })
        const validation = await trigger.validate().catch((e: any) => e)

        expect(validation.errors['catalogMulti']).not.toBeDefined()
      })

      it('is required if triggerKind is multi_product', async () => {
        const trigger = new Trigger({ triggerKind: 'multi_product', catalogMulti: '' })
        const validation = await trigger.validate().catch((e: any) => e)

        expect(validation.errors['catalogMulti'].message).toEqual(
          'Catalogo: deve ser preenchido quando o gatilho é do tipo vários produtos',
        )
      })
    })

    describe('catalogId', () => {
      it('is not required if triggerKind is not multi_product', async () => {
        const trigger = new Trigger({ triggerKind: 'single_product', catalogId: '' })
        const validation = await trigger.validate().catch((e: any) => e)

        expect(validation.errors['catalogId']).not.toBeDefined()
      })

      it('is required if triggerKind is multi_product', async () => {
        const trigger = new Trigger({ triggerKind: 'multi_product', catalogId: '' })
        const validation = await trigger.validate().catch((e: any) => e)

        expect(validation.errors['catalogId'].message).toEqual(
          'Id Catalogo: deve ser preenchido quando o gatilho é do tipo vários produtos',
        )
      })
    })

    describe('catalogSingle', () => {
      it('is not required if triggerKind is not single_product', async () => {
        const trigger = new Trigger({ triggerKind: 'multi_product', catalogSingle: '' })
        const validation = await trigger.validate().catch((e: any) => e)

        expect(validation.errors['catalogSingle']).not.toBeDefined()
      })

      it('is required if triggerKind is single_product', async () => {
        const trigger = new Trigger({ triggerKind: 'single_product', catalogSingle: '' })
        const validation = await trigger.validate().catch((e: any) => e)

        expect(validation.errors['catalogSingle'].message).toEqual(
          'Catalogo: deve ser preenchido quando o gatilho é do tipo produto único',
        )
      })
    })

    describe('textReplyButton', () => {
      it('is not required if triggerKind is not reply_button', async () => {
        const trigger = new Trigger({ triggerKind: 'multi_product', textReplyButton: '' })
        const validation = await trigger.validate().catch((e: any) => e)

        expect(validation.errors['textReplyButton']).not.toBeDefined()
      })

      it('is required if triggerKind is reply_button', async () => {
        const trigger = new Trigger({ triggerKind: 'reply_button', textReplyButton: '' })
        const validation = await trigger.validate().catch((e: any) => e)

        expect(validation.errors['textReplyButton'].message).toEqual(
          'Script: deve ser preenchido quando o gatilho é do tipo botões de resposta',
        )
      })
    })

    describe('messagesList', () => {
      it('is not required if triggerKind is not list_message', async () => {
        const trigger = new Trigger({ triggerKind: 'multi_product', messagesList: '' })
        const validation = await trigger.validate().catch((e: any) => e)

        expect(validation.errors['messagesList']).not.toBeDefined()
      })

      it('is required if triggerKind is list_message', async () => {
        const trigger = new Trigger({ triggerKind: 'list_message', messagesList: '' })
        const validation = await trigger.validate().catch((e: any) => e)

        expect(validation.errors['messagesList'].message).toEqual(
          'Mensagens: deve ser preenchido quando o gatilho é do tipo lista de mensagens',
        )
      })
    })

    describe('text', () => {
      it('is not required if triggerKind is not text', async () => {
        const trigger = new Trigger({ triggerKind: 'multi_product', text: '' })
        const validation = await trigger.validate().catch((e: any) => e)

        expect(validation.errors['text']).not.toBeDefined()
      })

      it('is required if triggerKind is text', async () => {
        const trigger = new Trigger({ triggerKind: 'text', text: '' })
        const validation = await trigger.validate().catch((e: any) => e)

        expect(validation.errors['text'].message).toEqual('Texto: deve ser preenchido quando o gatilho é do tipo texto')
      })
    })
  })
})
