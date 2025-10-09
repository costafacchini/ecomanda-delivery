import Licensee from '@models/Licensee.js'
import mongoServer from '../../../.jest/utils.js'
import { licensee as licenseeFactory } from '@factories/licensee.js'

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
      expect(licensee.pedidos10_active).toEqual(false)
      expect(licensee.useChatbot).toEqual(false)
      expect(licensee.apiToken).toBeDefined()
      expect(licensee.apiToken).not.toBe(null)
    })
  })

  describe('validations', () => {
    describe('name', () => {
      it('is required', () => {
        const licensee = new Licensee()
        const validation = licensee.validateSync()

        expect(validation.errors['name'].message).toEqual('Nome: Você deve preencher o campo')
      })

      it('greater than 4 characters', () => {
        const licensee = new Licensee({ name: 'abc' })
        const validation = licensee.validateSync()

        expect(validation.errors['name'].message).toEqual(
          'Nome: Informe um valor com mais que 4 caracteres! Atual: abc',
        )
      })
    })

    describe('licenseKind', () => {
      it('is required', () => {
        const licensee = new Licensee()
        const validation = licensee.validateSync()

        expect(validation.errors['licenseKind'].message).toEqual(
          'Tipo de Licença: Você deve informar um valor ( demo | free | paid)',
        )
      })

      it('accepts "demo", "free" and "paid" values', () => {
        let validation
        const licensee = new Licensee()

        licensee.licenseKind = 'demo'
        validation = licensee.validateSync()

        expect(validation.errors['licenseKind']).not.toBeDefined()

        licensee.licenseKind = 'paid'
        validation = licensee.validateSync()

        expect(validation.errors['licenseKind']).not.toBeDefined()

        licensee.licenseKind = 'paid'
        validation = licensee.validateSync()

        expect(validation.errors['licenseKind']).not.toBeDefined()
      })

      it('does not accepts another values', () => {
        const licensee = new Licensee({ licenseKind: 'some' })
        const validation = licensee.validateSync()

        expect(validation.errors['licenseKind'].message).toEqual(
          '`some` is not a valid enum value for path `licenseKind`.',
        )
      })
    })

    describe('chatbotDefault', () => {
      it('accepts blank value', () => {
        const licensee = new Licensee({ chatbotDefault: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['chatbotDefault']).not.toBeDefined()
      })

      it('accepts nil value', () => {
        const licensee = new Licensee()
        const validation = licensee.validateSync()

        expect(validation.errors['chatbotDefault']).not.toBeDefined()
      })

      it('accepts "landbot" value', () => {
        const licensee = new Licensee({ chatbotDefault: 'landbot' })
        const validation = licensee.validateSync()

        expect(validation.errors['chatbotDefault']).not.toBeDefined()
      })

      it('does not accepts another values', () => {
        const licensee = new Licensee({ chatbotDefault: 'some' })
        const validation = licensee.validateSync()

        expect(validation.errors['chatbotDefault'].message).toEqual(
          '`some` is not a valid enum value for path `chatbotDefault`.',
        )
      })
    })

    describe('chatbotUrl', () => {
      it('is not required if not useChatbot', () => {
        const licensee = new Licensee({ useChatbot: false, chatbotUrl: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['chatbotUrl']).not.toBeDefined()
      })

      it('is required if useChatbot', () => {
        const licensee = new Licensee({ useChatbot: true, chatbotUrl: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['chatbotUrl'].message).toEqual(
          'URL do Chatbot: deve ser preenchido quando utiliza Chatbot',
        )
      })
    })

    describe('chatbotAuthorizationToken', () => {
      it('is not required if not useChatbot', () => {
        const licensee = new Licensee({ useChatbot: false, chatbotAuthorizationToken: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['chatbotAuthorizationToken']).not.toBeDefined()
      })

      it('is required if useChatbot', () => {
        const licensee = new Licensee({ useChatbot: true, chatbotAuthorizationToken: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['chatbotAuthorizationToken'].message).toEqual(
          'Token de Autorização do Chatbot: deve ser preenchido quando utiliza Chatbot',
        )
      })
    })

    describe('whatsappDefault', () => {
      it('accepts blank value', () => {
        const licensee = new Licensee({ whatsappDefault: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['whatsappDefault']).not.toBeDefined()
      })

      it('accepts nil value', () => {
        const licensee = new Licensee()
        const validation = licensee.validateSync()

        expect(validation.errors['whatsappDefault']).not.toBeDefined()
      })

      it('accepts "utalk" and "dialog" values', () => {
        let validation
        const licensee = new Licensee()

        licensee.whatsappDefault = 'utalk'
        validation = licensee.validateSync()

        expect(validation.errors['whatsappDefault']).not.toBeDefined()

        licensee.whatsappDefault = 'dialog'
        validation = licensee.validateSync()

        expect(validation.errors['whatsappDefault']).not.toBeDefined()
      })

      it('does not accepts another values', () => {
        const licensee = new Licensee({ whatsappDefault: 'some' })
        const validation = licensee.validateSync()

        expect(validation.errors['whatsappDefault'].message).toEqual(
          '`some` is not a valid enum value for path `whatsappDefault`.',
        )
      })
    })

    describe('whatsappToken', () => {
      it('is not required if not whatsappDefault', () => {
        const licensee = new Licensee({ whatsappDefault: '', whatsappToken: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['whatsappToken']).not.toBeDefined()
      })

      it('is required if whatsappDefault', () => {
        const licensee = new Licensee({ whatsappDefault: 'dialog', whatsappToken: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['whatsappToken'].message).toEqual(
          'Token de Whatsapp: deve ser preenchido quando tiver um plugin configurado',
        )
      })
    })

    describe('whatsappUrl', () => {
      it('is not required if not whatsappDefault', () => {
        const licensee = new Licensee({ whatsappDefault: '', whatsappUrl: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['whatsappUrl']).not.toBeDefined()
      })

      it('is required if whatsappDefault', () => {
        const licensee = new Licensee({ whatsappDefault: 'dialog', whatsappUrl: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['whatsappUrl'].message).toEqual(
          'URL de Whatsapp: deve ser preenchido quando tiver um plugin configurado',
        )
      })
    })

    describe('chatDefault', () => {
      it('accepts blank value', () => {
        const licensee = new Licensee({ chatDefault: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['chatDefault']).not.toBeDefined()
      })

      it('accepts nil value', () => {
        const licensee = new Licensee()
        const validation = licensee.validateSync()

        expect(validation.errors['chatDefault']).not.toBeDefined()
      })

      it('accepts "rocketchat" and "crisp" values', () => {
        let validation
        const licensee = new Licensee()

        licensee.chatDefault = 'rocketchat'
        validation = licensee.validateSync()

        expect(validation.errors['chatDefault']).not.toBeDefined()

        licensee.chatDefault = 'crisp'
        validation = licensee.validateSync()

        expect(validation.errors['chatDefault']).not.toBeDefined()

        licensee.chatDefault = 'cuboup'
        validation = licensee.validateSync()

        expect(validation.errors['chatDefault']).not.toBeDefined()
      })

      it('does not accepts another values', () => {
        const licensee = new Licensee({ chatDefault: 'some' })
        const validation = licensee.validateSync()

        expect(validation.errors['chatDefault'].message).toEqual(
          '`some` is not a valid enum value for path `chatDefault`.',
        )
      })
    })

    describe('cartDefault', () => {
      it('accepts blank value', () => {
        const licensee = new Licensee({ cartDefault: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['cartDefault']).not.toBeDefined()
      })

      it('accepts nil value', () => {
        const licensee = new Licensee()
        const validation = licensee.validateSync()

        expect(validation.errors['cartDefault']).not.toBeDefined()
      })

      it('accepts "alloy" values', () => {
        let validation
        const licensee = new Licensee()

        licensee.cartDefault = 'alloy'
        validation = licensee.validateSync()

        expect(validation.errors['chatDefault']).not.toBeDefined()
      })

      it('accepts "go2go" values', () => {
        let validation
        const licensee = new Licensee()

        licensee.cartDefault = 'go2go'
        validation = licensee.validateSync()

        expect(validation.errors['chatDefault']).not.toBeDefined()
      })

      it('accepts "go2go v2" values', () => {
        let validation
        const licensee = new Licensee()

        licensee.cartDefault = 'go2go_v2'
        validation = licensee.validateSync()

        expect(validation.errors['chatDefault']).not.toBeDefined()
      })

      it('does not accepts another values', () => {
        const licensee = new Licensee({ cartDefault: 'some' })
        const validation = licensee.validateSync()

        expect(validation.errors['cartDefault'].message).toEqual(
          '`some` is not a valid enum value for path `cartDefault`.',
        )
      })
    })

    describe('chatUrl', () => {
      it('is not required if not chatDefault', () => {
        const licensee = new Licensee({ chatDefault: '', chatUrl: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['chatUrl']).not.toBeDefined()
      })

      it('is required if chatDefault', () => {
        const licensee = new Licensee({ chatDefault: 'dialog', chatUrl: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['chatUrl'].message).toEqual(
          'URL do Chat: deve ser preenchido quando tiver um plugin configurado',
        )
      })
    })

    describe('chatKey', () => {
      it('is not required', () => {
        const licensee = new Licensee({ chatDefault: '', chatUrl: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['chatUrl']).not.toBeDefined()
      })

      it('is required if chatDefault is crisp', () => {
        const licensee = new Licensee({ chatDefault: 'crisp', chatUrl: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['chatKey'].message).toEqual(
          'API Key do Chat: deve ser preenchido quando o plugin de chat for crisp ou chatwoot',
        )
      })
    })

    describe('chatIdentifier', () => {
      it('is not required', () => {
        const licensee = new Licensee({ chatDefault: '', chatUrl: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['chatUrl']).not.toBeDefined()
      })

      it('is required if chatDefault is crisp', () => {
        const licensee = new Licensee({ chatDefault: 'crisp', chatUrl: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['chatIdentifier'].message).toEqual(
          'Identifier (Conta) do Chat: deve ser preenchido quando o plugin de chat for crisp ou chatwoot',
        )
      })
    })

    describe('awsId', () => {
      it('is not required if whatsappDefault is dialog', () => {
        const licensee = new Licensee({ whatsappDefault: 'dialog', awsId: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['awsId']).not.toBeDefined()
      })

      it('is not required if whatsappDefault is not configured', () => {
        const licensee = new Licensee({ whatsappDefault: '', awsId: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['awsId']).not.toBeDefined()
      })

      it('is required if whatsappDefault is uTalk', () => {
        const licensee = new Licensee({ whatsappDefault: 'utalk', awsId: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['awsId'].message).toEqual(
          'Id da AWS: deve ser preenchido quando utilizar os plugins da uTalk',
        )
      })
    })

    describe('awsSecret', () => {
      it('is not required if whatsappDefault is dialog', () => {
        const licensee = new Licensee({ whatsappDefault: 'dialog', awsSecret: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['awsSecret']).not.toBeDefined()
      })

      it('is not required if whatsappDefault is not configured', () => {
        const licensee = new Licensee({ whatsappDefault: '', awsSecret: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['awsSecret']).not.toBeDefined()
      })

      it('is required if whatsappDefault is uTalk', () => {
        const licensee = new Licensee({ whatsappDefault: 'utalk', awsSecret: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['awsSecret'].message).toEqual(
          'Senha da AWS: deve ser preenchido quando utilizar os plugins da uTalk',
        )
      })
    })

    describe('bucketName', () => {
      it('is not required if whatsappDefault is dialog', () => {
        const licensee = new Licensee({ whatsappDefault: 'dialog', bucketName: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['bucketName']).not.toBeDefined()
      })

      it('is not required if whatsappDefault is not configured', () => {
        const licensee = new Licensee({ whatsappDefault: '', bucketName: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['bucketName']).not.toBeDefined()
      })

      it('is required if whatsappDefault is uTalk', () => {
        const licensee = new Licensee({ whatsappDefault: 'utalk', bucketName: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['bucketName'].message).toEqual(
          'Nome do Bucket da AWS: deve ser preenchido quando utilizar os plugins da uTalk',
        )
      })
    })

    describe('kind', () => {
      it('accepts "individual", "company" and blank values', () => {
        let validation
        const licensee = new Licensee()

        licensee.kind = 'individual'
        validation = licensee.validateSync()

        expect(validation.errors['kind']).not.toBeDefined()

        licensee.kind = 'company'
        validation = licensee.validateSync()

        expect(validation.errors['kind']).not.toBeDefined()

        licensee.kind = ''
        validation = licensee.validateSync()

        expect(validation.errors['kind']).not.toBeDefined()
      })

      it('does not accepts another values', () => {
        const licensee = new Licensee({ kind: 'some' })
        const validation = licensee.validateSync()

        expect(validation.errors['kind'].message).toEqual('`some` is not a valid enum value for path `kind`.')
      })
    })

    describe('bank', () => {
      it('accepts blank value', () => {
        const licensee = new Licensee({ bank: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['bank']).not.toBeDefined()
      })

      it('accepts value with 3 chars', () => {
        const licensee = new Licensee({ bank: '001' })
        const validation = licensee.validateSync()

        expect(validation.errors['bank']).not.toBeDefined()
      })

      it('does not accept value less than 3 chars', () => {
        let validation
        const licensee = new Licensee({ bank: '0' })
        validation = licensee.validateSync()

        expect(validation.errors['bank'].message).toEqual('Banco: Informe um valor com 3 caracteres! Atual: 0')

        licensee.bank = '00'
        validation = licensee.validateSync()

        expect(validation.errors['bank'].message).toEqual('Banco: Informe um valor com 3 caracteres! Atual: 00')
      })

      it('does not accept value greather than 3 chars', () => {
        let validation
        const licensee = new Licensee({ bank: '0011' })
        validation = licensee.validateSync()

        expect(validation.errors['bank'].message).toEqual('Banco: Informe um valor com 3 caracteres! Atual: 0011')

        licensee.bank = '00111'
        validation = licensee.validateSync()

        expect(validation.errors['bank'].message).toEqual('Banco: Informe um valor com 3 caracteres! Atual: 00111')
      })
    })

    describe('branch_number', () => {
      it('accepts blank value', () => {
        const licensee = new Licensee({ branch_number: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['branch_number']).not.toBeDefined()
      })

      it('less than 4 characters', () => {
        let validation
        const licensee = new Licensee({ branch_number: 'abc' })
        validation = licensee.validateSync()

        expect(validation.errors['kind']).not.toBeDefined()

        licensee.branch_number = 'abcde'
        validation = licensee.validateSync()

        expect(validation.errors['branch_number'].message).toEqual(
          'Agência: Informe um valor com até 4 caracteres! Atual: abcde',
        )
      })
    })

    describe('branch_check_digit', () => {
      it('accepts blank value', () => {
        const licensee = new Licensee({ branch_check_digit: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['branch_check_digit']).not.toBeDefined()
      })

      it('accepts value with 1 chars', () => {
        const licensee = new Licensee({ branch_check_digit: '1' })
        const validation = licensee.validateSync()

        expect(validation.errors['branch_check_digit']).not.toBeDefined()
      })

      it('does not accept value greather than 1 chars', () => {
        let validation
        const licensee = new Licensee({ branch_check_digit: '01' })
        validation = licensee.validateSync()

        expect(validation.errors['branch_check_digit'].message).toEqual(
          'Dígito Agência: Informe um valor com até 1 caracter! Atual: 01',
        )
      })
    })

    describe('account_number', () => {
      it('accepts blank value', () => {
        const licensee = new Licensee({ account_number: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['account_number']).not.toBeDefined()
      })

      it('less than 13 characters', () => {
        let validation
        const licensee = new Licensee({ account_number: '1234567890123' })
        validation = licensee.validateSync()

        expect(validation.errors['account_number']).not.toBeDefined()

        licensee.account_number = '12345678901234'
        validation = licensee.validateSync()

        expect(validation.errors['account_number'].message).toEqual(
          'Conta: Informe um valor com até 13 caracteres! Atual: 12345678901234',
        )
      })
    })

    describe('account_check_digit', () => {
      it('accepts blank value', () => {
        const licensee = new Licensee({ account_check_digit: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['account_check_digit']).not.toBeDefined()
      })

      it('accepts value with 1 chars', () => {
        const licensee = new Licensee({ account_check_digit: '1' })
        const validation = licensee.validateSync()

        expect(validation.errors['account_check_digit']).not.toBeDefined()
      })

      it('does not accept value greather than 1 chars', () => {
        let validation
        const licensee = new Licensee({ account_check_digit: '01' })
        validation = licensee.validateSync()

        expect(validation.errors['account_check_digit'].message).toEqual(
          'Dígito Conta: Informe um valor com até 1 caracter! Atual: 01',
        )
      })
    })

    describe('holder_kind', () => {
      it('accepts "individual", "company" and blank values', () => {
        let validation
        const licensee = new Licensee()

        licensee.holder_kind = 'individual'
        validation = licensee.validateSync()

        expect(validation.errors['holder_kind']).not.toBeDefined()

        licensee.holder_kind = 'company'
        validation = licensee.validateSync()

        expect(validation.errors['holder_kind']).not.toBeDefined()

        licensee.holder_kind = ''
        validation = licensee.validateSync()

        expect(validation.errors['holder_kind']).not.toBeDefined()
      })

      it('does not accepts another values', () => {
        const licensee = new Licensee({ holder_kind: 'some' })
        const validation = licensee.validateSync()

        expect(validation.errors['holder_kind'].message).toEqual(
          '`some` is not a valid enum value for path `holder_kind`.',
        )
      })
    })

    describe('account_type', () => {
      it('accepts "checking", "company" and blank values', () => {
        let validation
        const licensee = new Licensee()

        licensee.account_type = 'checking'
        validation = licensee.validateSync()

        expect(validation.errors['account_type']).not.toBeDefined()

        licensee.account_type = 'savings'
        validation = licensee.validateSync()

        expect(validation.errors['account_type']).not.toBeDefined()

        licensee.account_type = ''
        validation = licensee.validateSync()

        expect(validation.errors['account_type']).not.toBeDefined()
      })

      it('does not accepts another values', () => {
        const licensee = new Licensee({ account_type: 'some' })
        const validation = licensee.validateSync()

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
