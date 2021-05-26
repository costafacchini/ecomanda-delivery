const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId
const { v4: uuidv4 } = require('uuid')

const userSchema = new Schema({
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
    enum: ['utalk', 'winzap', 'chatapi', ''],
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
    enum: ['jivochat', 'rocketchat', ''],
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
  awsId: {
    type: String,
    required: [
      function () {
        return this.whatsappDefault === 'utalk' || this.whatsappDefault === 'winzap'
      },
      'Id da AWS: deve ser preenchido quando utilizar os plugins da uTalk ou Winzap',
    ],
  },
  awsSecret: {
    type: String,
    required: [
      function () {
        return this.whatsappDefault === 'utalk' || this.whatsappDefault === 'winzap'
      },
      'Senha da AWS: deve ser preenchido quando utilizar os plugins da uTalk ou Winzap',
    ],
  },
  bucketName: {
    type: String,
    required: [
      function () {
        return this.whatsappDefault === 'utalk' || this.whatsappDefault === 'winzap'
      },
      'Nome do Bucket da AWS: deve ser preenchido quando utilizar os plugins da uTalk ou Winzap',
    ],
  },
})

userSchema.pre('save', function (next) {
  const licensee = this

  if (licensee.whatsappDefault === 'utalk') {
    licensee.whatsappUrl = 'https://v1.utalk.chat/send/'
  }

  if (licensee.whatsappDefault === 'winzap') {
    licensee.whatsappUrl = 'https://api.winzap.com.br/send/'
  }

  if (!licensee._id) {
    licensee._id = new mongoose.Types.ObjectId()
  }
  next()
})

userSchema.set('toJSON', {
  virtuals: true,
})

userSchema.virtual('urlChatWebhook').get(function() {
  return `https://ecomanda-delivery.herokuapp.com/api/v1/chat/message/?token=${this.apiToken}`
})

userSchema.virtual('urlChatbotWebhook').get(function() {
  return `https://ecomanda-delivery.herokuapp.com/api/v1/chatbot/message/?token=${this.apiToken}`
})

userSchema.virtual('urlWhatsappWebhook').get(function() {
  return `https://ecomanda-delivery.herokuapp.com/api/v1/messenger/message/?token=${this.apiToken}`
})

const Licensee = mongoose.model('Licensee', userSchema)

module.exports = Licensee
