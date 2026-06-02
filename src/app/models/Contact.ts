import mongoose from 'mongoose'
import { NormalizePhone } from '../helpers/NormalizePhone'

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const cardsSchema = new Schema({
  credit_card_id: String,
  first_six_digits: String,
  last_four_digits: String,
  brand: String,
})

const contactSchema = new Schema(
  {
    _id: ObjectId,
    name: String,
    number: {
      type: String,
      required: [true, 'Numero: Você deve preencher o campo'],
    },
    type: String,
    talkingWithChatBot: {
      type: Boolean,
      required: [true, 'Talking with chatbot: Você deve preencher o campo'],
    },
    email: String,
    licensee: {
      type: ObjectId,
      ref: 'Licensee',
      required: [true, 'Licensee: Você deve preencher o campo'],
    },
    waId: String,
    isGroup: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    landbotId: String,
    chatwootId: String,
    chatwootSourceId: String,
    city: String,
    uf: String,
    wa_start_chat: Date,
    document: String,
    customer_id: String,
    credit_card_id: String,
    credit_cards: [cardsSchema],
  },
  { timestamps: true },
)

contactSchema.pre('save', function () {
  const contact = this

  if (!contact._id) {
    contact._id = new mongoose.Types.ObjectId()
  }

  if (contact.number.includes('@') || !contact.type) {
    const normalizedPhone = new NormalizePhone(contact.number)
    contact.number = normalizedPhone.number
    contact.type = normalizedPhone.type
  }

})

contactSchema.set('toJSON', {
  virtuals: true,
})

const Contact = mongoose.model('Contact', contactSchema)

export default Contact
