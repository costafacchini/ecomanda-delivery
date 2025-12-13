import mongoose from 'mongoose'

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const paramsSchema = new Schema({
  number: String,
  format: String,
})
const templateSchema = new Schema(
  {
    _id: ObjectId,
    name: {
      type: String,
      required: [true, 'Nome: Você deve preencher o campo'],
    }, // Apenas alfanuméricos minúsculos e underline, sem espaços
    namespace: String,
    language: String,
    category: String,
    waId: String,
    licensee: {
      type: ObjectId,
      ref: 'Licensee',
      required: [true, 'Licensee: Você deve preencher o campo'],
    },
    headerParams: [paramsSchema],
    bodyParams: [paramsSchema],
    footerParams: [paramsSchema],
    active: { type: Boolean, default: false },
  },
  { timestamps: true },
)

templateSchema.pre('save', function () {
  const template = this

  if (!template._id) {
    template._id = new mongoose.Types.ObjectId()
  }
})

templateSchema.set('toJSON', {
  virtuals: true,
})

const Template = mongoose.model('Template', templateSchema)

export default Template
