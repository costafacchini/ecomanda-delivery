import Licensee from '@models/Licensee'
import mongoServer from '../../../.jest/utils'
import { licensee as licenseeFactory } from '@factories/licensee'

describe('Licensee', () => {
  beforeEach(async () => {
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('before save', () => {
    it('generates _id', async () => {
      const licensee = await Licensee.create(licenseeFactory.build())

      expect(licensee._id).not.toEqual(null)
    })

    it('does not changes _id if licensee is changed', async () => {
      const licensee = await Licensee.create(licenseeFactory.build())

      licensee.name = 'Changed'
      const alteredLicensee = await licensee.save()

      expect(licensee._id).toEqual(alteredLicensee._id)
      expect(alteredLicensee.name).toEqual('Changed')
    })

    it('fills the fields that have a default value', () => {
      const licensee = new Licensee()

      expect(licensee.active).toEqual(true)
      expect(licensee.useChatbot).toEqual(false)
      expect(licensee.useSectors).toEqual(false)
      expect(licensee.apiToken).toBeDefined()
      expect(licensee.apiToken).not.toBe(null)
    })
  })

  describe('validations', () => {
    describe('name', () => {
      it('is required', async () => {
        const licensee = new Licensee()
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['name'].message).toEqual('Nome: Você deve preencher o campo')
      })

      it('greater than 4 characters', async () => {
        const licensee = new Licensee({ name: 'abc' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['name'].message).toEqual(
          'Nome: Informe um valor com mais que 4 caracteres! Atual: abc',
        )
      })
    })

    describe('licenseKind', () => {
      it('is required', async () => {
        const licensee = new Licensee()
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['licenseKind'].message).toEqual(
          'Tipo de Licença: Você deve informar um valor ( demo | free | paid)',
        )
      })

      it('accepts "demo", "free" and "paid" values', async () => {
        let validation
        const licensee = new Licensee()

        licensee.licenseKind = 'demo'
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['licenseKind']).not.toBeDefined()

        licensee.licenseKind = 'paid'
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['licenseKind']).not.toBeDefined()

        licensee.licenseKind = 'paid'
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['licenseKind']).not.toBeDefined()
      })

      it('does not accepts another values', async () => {
        const licensee = new Licensee({ licenseKind: 'some' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['licenseKind'].message).toEqual(
          '`some` is not a valid enum value for path `licenseKind`.',
        )
      })
    })

    describe('chatbotDefault', () => {
      it('accepts blank value', async () => {
        const licensee = new Licensee({ chatbotDefault: '' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['chatbotDefault']).not.toBeDefined()
      })

      it('accepts nil value', async () => {
        const licensee = new Licensee()
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['chatbotDefault']).not.toBeDefined()
      })

      it('accepts "landbot" value', async () => {
        const licensee = new Licensee({ chatbotDefault: 'landbot' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['chatbotDefault']).not.toBeDefined()
      })

      it('does not accepts another values', async () => {
        const licensee = new Licensee({ chatbotDefault: 'some' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['chatbotDefault'].message).toEqual(
          '`some` is not a valid enum value for path `chatbotDefault`.',
        )
      })
    })

    describe('chatbotUrl', () => {
      it('is not required if not useChatbot', async () => {
        const licensee = new Licensee({ useChatbot: false, chatbotUrl: '' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['chatbotUrl']).not.toBeDefined()
      })

      it('is required if useChatbot', async () => {
        const licensee = new Licensee({ useChatbot: true, chatbotUrl: '' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['chatbotUrl'].message).toEqual(
          'URL do Chatbot: deve ser preenchido quando utiliza Chatbot',
        )
      })
    })

    describe('chatbotAuthorizationToken', () => {
      it('is not required if not useChatbot', async () => {
        const licensee = new Licensee({ useChatbot: false, chatbotAuthorizationToken: '' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['chatbotAuthorizationToken']).not.toBeDefined()
      })

      it('is required if useChatbot', async () => {
        const licensee = new Licensee({ useChatbot: true, chatbotAuthorizationToken: '' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['chatbotAuthorizationToken'].message).toEqual(
          'Token de Autorização do Chatbot: deve ser preenchido quando utiliza Chatbot',
        )
      })
    })

    describe('whatsappDefault', () => {
      it('accepts blank value', async () => {
        const licensee = new Licensee({ whatsappDefault: '' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['whatsappDefault']).not.toBeDefined()
      })

      it('accepts nil value', async () => {
        const licensee = new Licensee()
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['whatsappDefault']).not.toBeDefined()
      })

      it('accepts "utalk" and "dialog" values', async () => {
        let validation
        const licensee = new Licensee()

        licensee.whatsappDefault = 'utalk'
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['whatsappDefault']).not.toBeDefined()

        licensee.whatsappDefault = 'dialog'
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['whatsappDefault']).not.toBeDefined()

        licensee.whatsappDefault = 'pabbly'
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['whatsappDefault']).not.toBeDefined()

        licensee.whatsappDefault = 'ycloud'
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['whatsappDefault']).not.toBeDefined()
      })

      it('does not accepts another values', async () => {
        const licensee = new Licensee({ whatsappDefault: 'some' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['whatsappDefault'].message).toEqual(
          '`some` is not a valid enum value for path `whatsappDefault`.',
        )
      })
    })

    describe('whatsappToken', () => {
      it('is not required if not whatsappDefault', async () => {
        const licensee = new Licensee({ whatsappDefault: '', whatsappToken: '' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['whatsappToken']).not.toBeDefined()
      })

      it('is required if whatsappDefault', async () => {
        const licensee = new Licensee({ whatsappDefault: 'dialog', whatsappToken: '' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['whatsappToken'].message).toEqual(
          'Token de Whatsapp: deve ser preenchido quando tiver um plugin configurado',
        )
      })
    })

    describe('whatsappUrl', () => {
      it('is not required if not whatsappDefault', async () => {
        const licensee = new Licensee({ whatsappDefault: '', whatsappUrl: '' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['whatsappUrl']).not.toBeDefined()
      })

      it('is required if whatsappDefault', async () => {
        const licensee = new Licensee({ whatsappDefault: 'dialog', whatsappUrl: '' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['whatsappUrl'].message).toEqual(
          'URL de Whatsapp: deve ser preenchido quando tiver um plugin configurado',
        )
      })
    })

    describe('chatDefault', () => {
      it('accepts blank value', async () => {
        const licensee = new Licensee({ chatDefault: '' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['chatDefault']).not.toBeDefined()
      })

      it('accepts nil value', async () => {
        const licensee = new Licensee()
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['chatDefault']).not.toBeDefined()
      })

      it('accepts "rocketchat" and "crisp" values', async () => {
        let validation
        const licensee = new Licensee()

        licensee.chatDefault = 'rocketchat'
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['chatDefault']).not.toBeDefined()

        licensee.chatDefault = 'crisp'
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['chatDefault']).not.toBeDefined()

        licensee.chatDefault = 'cuboup'
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['chatDefault']).not.toBeDefined()
      })

      it('does not accepts another values', async () => {
        const licensee = new Licensee({ chatDefault: 'some' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['chatDefault'].message).toEqual(
          '`some` is not a valid enum value for path `chatDefault`.',
        )
      })
    })

    describe('chatUrl', () => {
      it('is not required if not chatDefault', async () => {
        const licensee = new Licensee({ chatDefault: '', chatUrl: '' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['chatUrl']).not.toBeDefined()
      })

      it('is required if chatDefault', async () => {
        const licensee = new Licensee({ chatDefault: 'dialog', chatUrl: '' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['chatUrl'].message).toEqual(
          'URL do Chat: deve ser preenchido quando tiver um plugin configurado',
        )
      })
    })

    describe('chatKey', () => {
      it('is not required', async () => {
        const licensee = new Licensee({ chatDefault: '', chatUrl: '' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['chatUrl']).not.toBeDefined()
      })

      it('is required if chatDefault is crisp', async () => {
        const licensee = new Licensee({ chatDefault: 'crisp', chatUrl: '' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['chatKey'].message).toEqual(
          'API Key do Chat: deve ser preenchido quando o plugin de chat for crisp ou chatwoot',
        )
      })
    })

    describe('chatIdentifier', () => {
      it('is not required', async () => {
        const licensee = new Licensee({ chatDefault: '', chatUrl: '' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['chatUrl']).not.toBeDefined()
      })

      it('is required if chatDefault is crisp', async () => {
        const licensee = new Licensee({ chatDefault: 'crisp', chatUrl: '' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['chatIdentifier'].message).toEqual(
          'Identifier (Conta) do Chat: deve ser preenchido quando o plugin de chat for crisp ou chatwoot',
        )
      })
    })

    describe('kind', () => {
      it('accepts "individual", "company" and blank values', async () => {
        let validation
        const licensee = new Licensee()

        licensee.kind = 'individual'
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['kind']).not.toBeDefined()

        licensee.kind = 'company'
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['kind']).not.toBeDefined()

        licensee.kind = ''
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['kind']).not.toBeDefined()
      })

      it('does not accepts another values', async () => {
        const licensee = new Licensee({ kind: 'some' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['kind'].message).toEqual('`some` is not a valid enum value for path `kind`.')
      })
    })

    describe('bank', () => {
      it('accepts blank value', async () => {
        const licensee = new Licensee({ bank: '' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['bank']).not.toBeDefined()
      })

      it('accepts value with 3 chars', async () => {
        const licensee = new Licensee({ bank: '001' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['bank']).not.toBeDefined()
      })

      it('does not accept value less than 3 chars', async () => {
        let validation
        const licensee = new Licensee({ bank: '0' })
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['bank'].message).toEqual('Banco: Informe um valor com 3 caracteres! Atual: 0')

        licensee.bank = '00'
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['bank'].message).toEqual('Banco: Informe um valor com 3 caracteres! Atual: 00')
      })

      it('does not accept value greather than 3 chars', async () => {
        let validation
        const licensee = new Licensee({ bank: '0011' })
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['bank'].message).toEqual('Banco: Informe um valor com 3 caracteres! Atual: 0011')

        licensee.bank = '00111'
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['bank'].message).toEqual('Banco: Informe um valor com 3 caracteres! Atual: 00111')
      })
    })

    describe('branch_number', () => {
      it('accepts blank value', async () => {
        const licensee = new Licensee({ branch_number: '' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['branch_number']).not.toBeDefined()
      })

      it('less than 4 characters', async () => {
        let validation
        const licensee = new Licensee({ branch_number: 'abc' })
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['kind']).not.toBeDefined()

        licensee.branch_number = 'abcde'
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['branch_number'].message).toEqual(
          'Agência: Informe um valor com até 4 caracteres! Atual: abcde',
        )
      })
    })

    describe('branch_check_digit', () => {
      it('accepts blank value', async () => {
        const licensee = new Licensee({ branch_check_digit: '' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['branch_check_digit']).not.toBeDefined()
      })

      it('accepts value with 1 chars', async () => {
        const licensee = new Licensee({ branch_check_digit: '1' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['branch_check_digit']).not.toBeDefined()
      })

      it('does not accept value greather than 1 chars', async () => {
        let validation
        const licensee = new Licensee({ branch_check_digit: '01' })
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['branch_check_digit'].message).toEqual(
          'Dígito Agência: Informe um valor com até 1 caracter! Atual: 01',
        )
      })
    })

    describe('account_number', () => {
      it('accepts blank value', async () => {
        const licensee = new Licensee({ account_number: '' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['account_number']).not.toBeDefined()
      })

      it('less than 13 characters', async () => {
        let validation
        const licensee = new Licensee({ account_number: '1234567890123' })
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['account_number']).not.toBeDefined()

        licensee.account_number = '12345678901234'
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['account_number'].message).toEqual(
          'Conta: Informe um valor com até 13 caracteres! Atual: 12345678901234',
        )
      })
    })

    describe('account_check_digit', () => {
      it('accepts blank value', async () => {
        const licensee = new Licensee({ account_check_digit: '' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['account_check_digit']).not.toBeDefined()
      })

      it('accepts value with 1 chars', async () => {
        const licensee = new Licensee({ account_check_digit: '1' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['account_check_digit']).not.toBeDefined()
      })

      it('does not accept value greather than 1 chars', async () => {
        let validation
        const licensee = new Licensee({ account_check_digit: '01' })
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['account_check_digit'].message).toEqual(
          'Dígito Conta: Informe um valor com até 1 caracter! Atual: 01',
        )
      })
    })

    describe('holder_kind', () => {
      it('accepts "individual", "company" and blank values', async () => {
        let validation
        const licensee = new Licensee()

        licensee.holder_kind = 'individual'
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['holder_kind']).not.toBeDefined()

        licensee.holder_kind = 'company'
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['holder_kind']).not.toBeDefined()

        licensee.holder_kind = ''
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['holder_kind']).not.toBeDefined()
      })

      it('does not accepts another values', async () => {
        const licensee = new Licensee({ holder_kind: 'some' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['holder_kind'].message).toEqual(
          '`some` is not a valid enum value for path `holder_kind`.',
        )
      })
    })

    describe('account_type', () => {
      it('accepts "checking", "company" and blank values', async () => {
        let validation
        const licensee = new Licensee()

        licensee.account_type = 'checking'
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['account_type']).not.toBeDefined()

        licensee.account_type = 'savings'
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['account_type']).not.toBeDefined()

        licensee.account_type = ''
        validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['account_type']).not.toBeDefined()
      })

      it('does not accepts another values', async () => {
        const licensee = new Licensee({ account_type: 'some' })
        const validation = await licensee.validate().catch((e: any) => e)

        expect(validation.errors['account_type'].message).toEqual(
          '`some` is not a valid enum value for path `account_type`.',
        )
      })
    })
  })

  describe('links', () => {
    describe('chat webhook', () => {
      it('returns the url to webhook of chat', async () => {
        const licensee = await Licensee.create({ name: 'Alcateia', licenseKind: 'demo' })

        expect(licensee.urlChatWebhook).toEqual(
          `https://clave-digital.herokuapp.com/api/v1/chat/message/?token=${licensee.apiToken}`,
        )
      })
    })

    describe('chatbot webhook', () => {
      it('returns the url to webhook of chatbot', async () => {
        const licensee = await Licensee.create({ name: 'Alcateia', licenseKind: 'demo' })

        expect(licensee.urlChatbotWebhook).toEqual(
          `https://clave-digital.herokuapp.com/api/v1/chatbot/message/?token=${licensee.apiToken}`,
        )
      })
    })

    describe('chatbot transfer webhook', () => {
      it('returns the url to webhook of chatbot transfer to chat', async () => {
        const licensee = await Licensee.create({ name: 'Alcateia', licenseKind: 'demo' })

        expect(licensee.urlChatbotTransfer).toEqual(
          `https://clave-digital.herokuapp.com/api/v1/chatbot/transfer/?token=${licensee.apiToken}`,
        )
      })
    })

    describe('whatsapp webhook', () => {
      it('returns the url to webhook of whatsapp', async () => {
        const licensee = await Licensee.create({ name: 'Alcateia', licenseKind: 'demo' })

        expect(licensee.urlWhatsappWebhook).toEqual(
          `https://clave-digital.herokuapp.com/api/v1/messenger/message/?token=${licensee.apiToken}`,
        )
      })
    })
  })
})
