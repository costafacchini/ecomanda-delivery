const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const backgroundjobSchema = new Schema(
  {
    _id: ObjectId,
    licensee: {
      type: ObjectId,
      ref: 'Licensee',
      required: [true, 'Licensee: Você deve preencher o campo'],
    },
    status: {
      type: String,
      default: 'scheduled',
      enum: ['scheduled', 'running', 'done', 'error'],
      required: [true, 'Status: Você deve informar um valor ( scheduled | running | done | error)'],
    },
    kind: {
      type: String,
      enum: ['get-pix'],
      required: [true, 'Tipo do job: Você deve informar um valor ( get-pix )'],
    },
    error: String,
    body: { type: Object },
    response: { type: Object },
  },
  { timestamps: true },
)

backgroundjobSchema.pre('save', function (next) {
  const backgroundjob = this

  if (!backgroundjob._id) {
    backgroundjob._id = new mongoose.Types.ObjectId()
  }

  next()
})

backgroundjobSchema.set('toJSON', {
  virtuals: true,
})

const Backgroundjob = mongoose.model('Backgroundjob', backgroundjobSchema)

module.exports = Backgroundjob
