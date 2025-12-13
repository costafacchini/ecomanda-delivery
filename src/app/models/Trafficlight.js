import mongoose from 'mongoose'

const { Schema } = mongoose
const ObjectId = Schema.ObjectId

const trafficlightSchema = new Schema(
  {
    _id: ObjectId,
    key: { type: String, required: [true, 'Key: Você deve preencher o campo'] },
    token: { type: String, required: [true, 'Token: Você deve preencher o campo'] },
    expiresAt: { type: Date, required: [true, 'Data de Expiração: Você deve preencher o campo'] },
  },
  { versionKey: false, timestamps: false },
)

trafficlightSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

trafficlightSchema.pre('save', function () {
  const trafficlight = this

  if (!trafficlight._id) {
    trafficlight._id = new mongoose.Types.ObjectId()
  }
})

trafficlightSchema.set('toJSON', {
  virtuals: true,
})

const Trafficlight = mongoose.model('Trafficlight', trafficlightSchema)

export default Trafficlight
