const Licensee = require('@models/licensee')
const mongoServer = require('.jest/utils')

describe('Licensee', () => {
  beforeEach(async () => {
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('before save', () => {
    it('generates _id', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia', licenseKind: 'demo' })

      expect(licensee._id).not.toEqual(null)
    })

    it('does not changes _id if licensee is changed', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia', licenseKind: 'demo' })

      licensee.name = 'Changed'
      const alteredLicensee = await licensee.save()

      expect(licensee._id).toEqual(alteredLicensee._id)
      expect(alteredLicensee.name).toEqual('Changed')
    })

    it('fills the fields that have a default value', () => {
      const licensee = new Licensee()

      expect(licensee.active).toEqual(true)
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
          'Nome: Informe um valor com mais que 4 caracteres! Atual: abc'
        )
      })
    })

    describe('licenseKind', () => {
      it('is required', () => {
        const licensee = new Licensee()
        const validation = licensee.validateSync()

        expect(validation.errors['licenseKind'].message).toEqual(
          'Tipo de Licennça: Você deve informar um valor ( demo | free | paid)'
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
          '`some` is not a valid enum value for path `licenseKind`.'
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
          '`some` is not a valid enum value for path `chatbotDefault`.'
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
          'URL do Chatbot: deve ser preenchido quando utiliza Chatbot'
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
          'Token de Autorização do Chatbot: deve ser preenchido quando utiliza Chatbot'
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

      it('accepts "utalk", "winzap" and "chatapi" values', () => {
        let validation
        const licensee = new Licensee()

        licensee.whatsappDefault = 'utalk'
        validation = licensee.validateSync()

        expect(validation.errors['whatsappDefault']).not.toBeDefined()

        licensee.whatsappDefault = 'winzap'
        validation = licensee.validateSync()

        expect(validation.errors['whatsappDefault']).not.toBeDefined()

        licensee.whatsappDefault = 'chatapi'
        validation = licensee.validateSync()

        expect(validation.errors['whatsappDefault']).not.toBeDefined()
      })

      it('does not accepts another values', () => {
        const licensee = new Licensee({ whatsappDefault: 'some' })
        const validation = licensee.validateSync()

        expect(validation.errors['whatsappDefault'].message).toEqual(
          '`some` is not a valid enum value for path `whatsappDefault`.'
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
        const licensee = new Licensee({ whatsappDefault: 'chatapi', whatsappToken: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['whatsappToken'].message).toEqual(
          'Token de Whatsapp: deve ser preenchido quando tiver um plugin configurado'
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
        const licensee = new Licensee({ whatsappDefault: 'chatapi', whatsappUrl: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['whatsappUrl'].message).toEqual(
          'URL de Whatsapp: deve ser preenchido quando tiver um plugin configurado'
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

      it('accepts "jivochat" and "rocketchat" values', () => {
        let validation
        const licensee = new Licensee()

        licensee.chatDefault = 'jivochat'
        validation = licensee.validateSync()

        expect(validation.errors['chatDefault']).not.toBeDefined()

        licensee.chatDefault = 'rocketchat'
        validation = licensee.validateSync()

        expect(validation.errors['chatDefault']).not.toBeDefined()
      })

      it('does not accepts another values', () => {
        const licensee = new Licensee({ chatDefault: 'some' })
        const validation = licensee.validateSync()

        expect(validation.errors['chatDefault'].message).toEqual(
          '`some` is not a valid enum value for path `chatDefault`.'
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
        const licensee = new Licensee({ chatDefault: 'chatapi', chatUrl: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['chatUrl'].message).toEqual(
          'URL do Chat: deve ser preenchido quando tiver um plugin configurado'
        )
      })
    })

    describe('awsId', () => {
      it('is not required if whatsappDefault is chatapi', () => {
        const licensee = new Licensee({ whatsappDefault: 'chatapi', awsId: '' })
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
          'Id da AWS: deve ser preenchido quando utilizar os plugins da uTalk ou Winzap'
        )
      })

      it('is required if whatsappDefault is winzap', () => {
        const licensee = new Licensee({ whatsappDefault: 'winzap', awsId: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['awsId'].message).toEqual(
          'Id da AWS: deve ser preenchido quando utilizar os plugins da uTalk ou Winzap'
        )
      })
    })

    describe('awsSecret', () => {
      it('is not required if whatsappDefault is chatapi', () => {
        const licensee = new Licensee({ whatsappDefault: 'chatapi', awsSecret: '' })
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
          'Senha da AWS: deve ser preenchido quando utilizar os plugins da uTalk ou Winzap'
        )
      })

      it('is required if whatsappDefault is winzap', () => {
        const licensee = new Licensee({ whatsappDefault: 'winzap', awsSecret: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['awsSecret'].message).toEqual(
          'Senha da AWS: deve ser preenchido quando utilizar os plugins da uTalk ou Winzap'
        )
      })
    })

    describe('bucketName', () => {
      it('is not required if whatsappDefault is chatapi', () => {
        const licensee = new Licensee({ whatsappDefault: 'chatapi', bucketName: '' })
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
          'Nome do Bucket da AWS: deve ser preenchido quando utilizar os plugins da uTalk ou Winzap'
        )
      })

      it('is required if whatsappDefault is winzap', () => {
        const licensee = new Licensee({ whatsappDefault: 'winzap', bucketName: '' })
        const validation = licensee.validateSync()

        expect(validation.errors['bucketName'].message).toEqual(
          'Nome do Bucket da AWS: deve ser preenchido quando utilizar os plugins da uTalk ou Winzap'
        )
      })
    })
  })
})
