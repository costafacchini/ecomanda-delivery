import mongoose from 'mongoose'

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const integrationlogSchema = new Schema(
  {
    _id: ObjectId,
    log_description: String,
    log_payload: { type: Object },
    licensee: {
      type: ObjectId,
      ref: 'Licensee',
      required: [true, 'Licensee: Você deve preencher o campo'],
    },
    contact: {
      type: ObjectId,
      ref: 'Contact',
    },
    cart: {
      type: ObjectId,
      ref: 'Cart',
    },
  },
  { timestamps: true },
)

integrationlogSchema.pre('save', function () {
  const integrationlog = this

  if (!integrationlog._id) {
    integrationlog._id = new mongoose.Types.ObjectId()
  }
})

integrationlogSchema.set('toJSON', {
  virtuals: true,
})

const Integrationlog = mongoose.model('Integrationlog', integrationlogSchema)

export default Integrationlog
