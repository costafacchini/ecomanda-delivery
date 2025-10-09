import mongoose from 'mongoose'

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const messageSchema = new Schema(
  {
    _id: ObjectId,
    number: {
      type: String,
      required: [true, 'Number: Você deve preencher o campo'],
    },
    fromMe: { type: Boolean, default: false },
    text: {
      type: String,
      required: [
        function () {
          return this.kind === 'text'
        },
        'Texto: deve ser preenchido quando o tipo de mensahem é texto',
      ],
    },
    url: {
      type: String,
      required: [
        function () {
          return this.kind === 'file'
        },
        'URL do arquivo: deve ser preenchido quando o tipo de mensagem é arquivo',
      ],
    },
    fileName: {
      type: String,
      required: [
        function () {
          return this.kind === 'file'
        },
        'Nome do arquivo: deve ser preenchido quando o tipo de mensagem é arquivo',
      ],
    },
    kind: {
      type: String,
      enum: ['text', 'file', 'location', 'interactive', 'cart', 'template'],
      default: 'text',
    },
    destination: {
      type: String,
      enum: ['to-chatbot', 'to-chat', 'to-messenger', 'to-transfer'],
      required: [
        true,
        'Destino: Você deve informar qual o destino da mensagem (to-chatbot | to-chat | to-messenger | to-transfer)',
      ],
    },
    latitude: Number,
    longitude: Number,
    departament: String,
    senderName: String,
    sended: { type: Boolean, default: false },
    licensee: {
      type: ObjectId,
      ref: 'Licensee',
      required: [true, 'Licensee: Você deve preencher o campo'],
    },
    contact: {
      type: ObjectId,
      ref: 'Contact',
      required: [true, 'Contact: Você deve preencher o campo'],
    },
    room: {
      type: ObjectId,
      ref: 'Room',
    },
    trigger: {
      type: ObjectId,
      ref: 'Trigger',
    },
    cart: {
      type: ObjectId,
      ref: 'Cart',
    },
    messageWaId: String,
    attachmentWaId: String,
    sendedAt: Date,
    readAt: Date,
    deliveredAt: Date,
    error: String,
  },
  { timestamps: true },
)

messageSchema.pre('save', function (next) {
  const message = this

  if (!message._id) {
    message._id = new mongoose.Types.ObjectId()
  }
  next()
})

messageSchema.set('toJSON', {
  virtuals: true,
})

const Message = mongoose.model('Message', messageSchema)

export default Message
