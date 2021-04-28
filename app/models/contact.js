const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId
const NormalizePhone = require('../helpers/normalize-phone')

const contactSchema = new Schema({
  _id: ObjectId,
  name: String,
  number: {
    type: String,
    required: [
      true,
      'Numero: Você deve preencher o campo'
    ]
  },
  type: String,
  talkingWithChatBot: {
    type: Boolean,
    required: [
      true,
      'Talking with chatbot: Você deve preencher o campo'
    ]
  },
  roomId: String,
  licensee: {
    type: ObjectId,
    ref: 'Licensee',
    required: [
      true,
      'Licensee: Você deve preencher o campo'
    ]
  },
})

contactSchema.pre('save', function (next) {
  const contact = this

  if (!contact._id) {
    contact._id = new mongoose.Types.ObjectId()
  }

  const normalizedPhone = new NormalizePhone(contact.number)
  contact.number = normalizedPhone.number
  contact.type = normalizedPhone.type
  
  next()
})

contactSchema.set('toJSON', {
  virtuals: true,
})

const Contact = mongoose.model('Contact', contactSchema)

module.exports = Contact
