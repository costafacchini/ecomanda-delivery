import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const licenseeSchema = new Schema(
  {
    _id: ObjectId,
    name: {
      type: String,
      required: [true, 'Nome: Você deve preencher o campo'],
      validate: {
        validator: (value: any) => {
          return value.length >= 4
        },
        message: (props: any) => `Nome: Informe um valor com mais que 4 caracteres! Atual: ${props.value}`,
      },
    },
    email: String,
    phone: String,
    active: { type: Boolean, default: true },
    apiToken: { type: String, unique: true, default: uuidv4 },
    licenseKind: {
      type: String,
      enum: ['demo', 'free', 'paid'],
      required: [true, 'Tipo de Licença: Você deve informar um valor ( demo | free | paid)'],
    },
    useChatbot: { type: Boolean, default: false },
    chatbotDefault: {
      type: String,
      enum: ['landbot', ''],
      required: function (this: any) {
        return this.useChatbot === true
      },
    },
    chatbotUrl: {
      type: String,
      required: [
        function (this: any) {
          return this.useChatbot === true
        },
        'URL do Chatbot: deve ser preenchido quando utiliza Chatbot',
      ],
    },
    chatbotApiToken: String,
    messageOnResetChatbot: String,
    messageOnCloseChat: String,
    chatbotAuthorizationToken: {
      type: String,
      required: [
        function (this: any) {
          return this.useChatbot === true
        },
        'Token de Autorização do Chatbot: deve ser preenchido quando utiliza Chatbot',
      ],
    },
    whatsappDefault: {
      type: String,
      enum: ['utalk', 'dialog', 'ycloud', 'pabbly', 'baileys', ''],
    },
    whatsappToken: {
      type: String,
      required: [
        function (this: any) {
          return !!this.whatsappDefault && this.whatsappDefault !== 'baileys'
        },
        'Token de Whatsapp: deve ser preenchido quando tiver um plugin configurado',
      ],
    },
    whatsappUrl: {
      type: String,
      required: [
        function (this: any) {
          return !!this.whatsappDefault && this.whatsappDefault !== 'baileys'
        },
        'URL de Whatsapp: deve ser preenchido quando tiver um plugin configurado',
      ],
    },
    chatDefault: {
      type: String,
      enum: ['rocketchat', 'crisp', 'cuboup', 'chatwoot', ''],
    },
    chatUrl: {
      type: String,
      required: [
        function (this: any) {
          return !!this.chatDefault
        },
        'URL do Chat: deve ser preenchido quando tiver um plugin configurado',
      ],
    },
    chatKey: {
      type: String,
      required: [
        function (this: any) {
          return ['crisp', 'chatwoot'].includes(this.chatDefault)
        },
        'API Key do Chat: deve ser preenchido quando o plugin de chat for crisp ou chatwoot',
      ],
    },
    chatIdentifier: {
      type: String,
      required: [
        function (this: any) {
          return ['crisp', 'chatwoot'].includes(this.chatDefault)
        },
        'Identifier (Conta) do Chat: deve ser preenchido quando o plugin de chat for crisp ou chatwoot',
      ],
    },
    unidadeId: String,
    statusId: String,
    useWhatsappWindow: { type: Boolean, default: false },
    productFractional2Name: String,
    productFractional2Id: String,
    productFractional3Name: String,
    productFractional3Id: String,
    productFractionalSize3Name: String,
    productFractionalSize3Id: String,
    productFractionalSize4Name: String,
    productFractionalSize4Id: String,
    productFractionals: {
      type: Object,
    },
    document: String,
    kind: {
      type: String,
      enum: ['individual', 'company', ''],
    },
    financial_player_fee: Number,
    holder_name: String,
    bank: {
      type: String,
      validate: {
        validator: (value: any) => {
          return value.length == 0 || value.length == 3
        },
        message: (props: any) => `Banco: Informe um valor com 3 caracteres! Atual: ${props.value}`,
      },
    },
    branch_number: {
      type: String,
      validate: {
        validator: (value: any) => {
          return value.length <= 4
        },
        message: (props: any) => `Agência: Informe um valor com até 4 caracteres! Atual: ${props.value}`,
      },
    },
    branch_check_digit: {
      type: String,
      validate: {
        validator: (value: any) => {
          return value.length <= 1
        },
        message: (props: any) => `Dígito Agência: Informe um valor com até 1 caracter! Atual: ${props.value}`,
      },
    },
    account_number: {
      type: String,
      validate: {
        validator: (value: any) => {
          return value.length <= 13
        },
        message: (props: any) => `Conta: Informe um valor com até 13 caracteres! Atual: ${props.value}`,
      },
    },
    account_check_digit: {
      type: String,
      validate: {
        validator: (value: any) => {
          return value.length <= 1
        },
        message: (props: any) => `Dígito Conta: Informe um valor com até 1 caracter! Atual: ${props.value}`,
      },
    },
    holder_kind: {
      type: String,
      enum: ['individual', 'company', ''],
    },
    holder_document: String,
    account_type: {
      type: String,
      enum: ['checking', 'savings', ''],
    },
    card_information_url: String,
    useSenderName: { type: Boolean, default: false },
    useFileIDYcloud: { type: Boolean, default: false },
  },
  { timestamps: true },
)

licenseeSchema.pre('save', function () {
  const licensee = this

  if (licensee.whatsappDefault === 'utalk') {
    licensee.whatsappUrl = 'https://v1.utalk.chat/send/'
  }

  if (licensee.whatsappDefault === 'dialog') {
    licensee.whatsappUrl = 'https://waba.360dialog.io/'
  }

  if (licensee.whatsappDefault === 'ycloud') {
    licensee.whatsappUrl = 'https://api.ycloud.com/v2/'
  }

  if (!licensee._id) {
    licensee._id = new mongoose.Types.ObjectId()
  }
})

licenseeSchema.set('toJSON', {
  virtuals: true,
})

licenseeSchema.virtual('urlChatWebhook').get(function () {
  return `https://clave-digital.herokuapp.com/api/v1/chat/message/?token=${this.apiToken}`
})

licenseeSchema.virtual('urlChatbotWebhook').get(function () {
  return `https://clave-digital.herokuapp.com/api/v1/chatbot/message/?token=${this.apiToken}`
})

licenseeSchema.virtual('urlChatbotTransfer').get(function () {
  return `https://clave-digital.herokuapp.com/api/v1/chatbot/transfer/?token=${this.apiToken}`
})

licenseeSchema.virtual('urlWhatsappWebhook').get(function () {
  return `https://clave-digital.herokuapp.com/api/v1/messenger/message/?token=${this.apiToken}`
})

const Licensee = mongoose.model('Licensee', licenseeSchema)

export default Licensee
