const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId
const { v4: uuidv4 } = require('uuid')

const licenseeSchema = new Schema(
  {
    _id: ObjectId,
    name: {
      type: String,
      required: [true, 'Nome: Você deve preencher o campo'],
      validate: {
        validator: (value) => {
          return value.length >= 4
        },
        message: (props) => `Nome: Informe um valor com mais que 4 caracteres! Atual: ${props.value}`,
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
      required: () => {
        return this.useChatbot === true
      },
    },
    chatbotUrl: {
      type: String,
      required: [
        function () {
          return this.useChatbot === true
        },
        'URL do Chatbot: deve ser preenchido quando utiliza Chatbot',
      ],
    },
    chatbotApiToken: String,
    messageOnResetChatbot: String,
    chatbotAuthorizationToken: {
      type: String,
      required: [
        function () {
          return this.useChatbot === true
        },
        'Token de Autorização do Chatbot: deve ser preenchido quando utiliza Chatbot',
      ],
    },
    whatsappDefault: {
      type: String,
      enum: ['utalk', 'dialog', ''],
    },
    whatsappToken: {
      type: String,
      required: [
        function () {
          return !!this.whatsappDefault
        },
        'Token de Whatsapp: deve ser preenchido quando tiver um plugin configurado',
      ],
    },
    whatsappUrl: {
      type: String,
      required: [
        function () {
          return !!this.whatsappDefault
        },
        'URL de Whatsapp: deve ser preenchido quando tiver um plugin configurado',
      ],
    },
    chatDefault: {
      type: String,
      enum: ['jivochat', 'rocketchat', 'crisp', 'cubouop', ''],
    },
    chatUrl: {
      type: String,
      required: [
        function () {
          return !!this.chatDefault
        },
        'URL do Chat: deve ser preenchido quando tiver um plugin configurado',
      ],
    },
    chatKey: {
      type: String,
      required: [
        function () {
          return this.chatDefault === 'crisp'
        },
        'Key do Chat: deve ser preenchido quando o plugin de chat for crisp',
      ],
    },
    chatIdentifier: {
      type: String,
      required: [
        function () {
          return this.chatDefault === 'crisp'
        },
        'Identifier do Chat: deve ser preenchido quando o plugin de chat for crisp',
      ],
    },
    awsId: {
      type: String,
      required: [
        function () {
          return this.whatsappDefault === 'utalk'
        },
        'Id da AWS: deve ser preenchido quando utilizar os plugins da uTalk',
      ],
    },
    awsSecret: {
      type: String,
      required: [
        function () {
          return this.whatsappDefault === 'utalk'
        },
        'Senha da AWS: deve ser preenchido quando utilizar os plugins da uTalk',
      ],
    },
    bucketName: {
      type: String,
      required: [
        function () {
          return this.whatsappDefault === 'utalk'
        },
        'Nome do Bucket da AWS: deve ser preenchido quando utilizar os plugins da uTalk',
      ],
    },
    cartDefault: {
      type: String,
      enum: ['go2go', ''],
    },
    unidadeId: String,
    statusId: String,
    useWhatsappWindow: { type: Boolean, default: false },
  },
  { timestamps: true }
)

licenseeSchema.pre('save', function (next) {
  const licensee = this

  if (licensee.whatsappDefault === 'utalk') {
    licensee.whatsappUrl = 'https://v1.utalk.chat/send/'
  }

  if (licensee.whatsappDefault === 'dialog') {
    licensee.whatsappUrl = 'https://waba.360dialog.io/'
  }

  if (!licensee._id) {
    licensee._id = new mongoose.Types.ObjectId()
  }
  next()
})

licenseeSchema.post('save', function (licensee) {
  if (licensee.whatsappDefault === 'dialog') {
    //
  }
})

licenseeSchema.set('toJSON', {
  virtuals: true,
})

licenseeSchema.virtual('urlChatWebhook').get(function () {
  return `https://ecomanda-delivery.herokuapp.com/api/v1/chat/message/?token=${this.apiToken}`
})

licenseeSchema.virtual('urlChatbotWebhook').get(function () {
  return `https://ecomanda-delivery.herokuapp.com/api/v1/chatbot/message/?token=${this.apiToken}`
})

licenseeSchema.virtual('urlChatbotTransfer').get(function () {
  return `https://ecomanda-delivery.herokuapp.com/api/v1/chatbot/transfer/?token=${this.apiToken}`
})

licenseeSchema.virtual('urlWhatsappWebhook').get(function () {
  return `https://ecomanda-delivery.herokuapp.com/api/v1/messenger/message/?token=${this.apiToken}`
})

const Licensee = mongoose.model('Licensee', licenseeSchema)

module.exports = Licensee
