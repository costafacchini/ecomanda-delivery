import mongoose from 'mongoose'

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const whatsappSessionSchema = new Schema(
  {
    _id: ObjectId,
    licensee: {
      type: ObjectId,
      ref: 'Licensee',
      required: [true, 'Licensee: Você deve preencher o campo'],
    },
    department: {
      type: ObjectId,
      ref: 'Department',
      default: null,
    },
    creds: { type: Object },
    keys: { type: Object },
  },
  { timestamps: true },
)

whatsappSessionSchema.index({ licensee: 1, department: 1 }, { unique: true })

whatsappSessionSchema.pre('save', function () {
  if (!this._id) {
    this._id = new mongoose.Types.ObjectId()
  }
})

whatsappSessionSchema.set('toJSON', { virtuals: true })

const WhatsappSession = mongoose.model('WhatsappSession', whatsappSessionSchema)

export default WhatsappSession
