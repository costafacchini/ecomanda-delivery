const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const bodySchema = new Schema({
  _id: ObjectId,
  content: {
    type: Object,
    required: [true, 'Conteúdo: Você deve preencher o campo'],
  },
  licensee: {
    type: ObjectId,
    ref: 'Licensee',
    required: [true, 'Licensee: Você deve preencher o campo'],
  },
  concluded: { type: Boolean, default: false },
}, { timestamps: true })

bodySchema.pre('save', function (next) {
  const body = this

  if (!body._id) {
    body._id = new mongoose.Types.ObjectId()
  }

  next()
})

bodySchema.set('toJSON', {
  virtuals: true,
})

const Body = mongoose.model('Body', bodySchema)

module.exports = Body
