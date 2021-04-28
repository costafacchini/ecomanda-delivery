const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const messageSchema = new Schema({
  _id: ObjectId,
  number: {
    type: String,
    required: [
      true,
      'Number: Você deve preencher o campo',
    ]
  },
  fromMe: { type: Boolean, default: false },
  text: {
    type: String,
    required: [
      true,
      'Text: Você deve preencher o campo',
    ]
  },
  sended: { type: Boolean, default: false },
  receivedAt: Date,
  reededAt: Date,
  sentAt: Date,
  licensee: {
    type: ObjectId,
    ref: 'Licensee',
    required: [
      true,
      'Licensee: Você deve preencher o campo',
    ]
  },
  contact: {
    type: ObjectId,
    ref: 'Contact',
    required: [
      true,
      'Contact: Você deve preencher o campo',
    ]
  },
})

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

module.exports = Message
