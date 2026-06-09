import mongoose from 'mongoose'

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const setorSchema = new Schema(
  {
    _id: ObjectId,
    name: {
      type: String,
      required: [true, 'Nome: Você deve preencher o campo'],
    },
    licensee: {
      type: ObjectId,
      ref: 'Licensee',
      required: [true, 'Licensee: Você deve preencher o campo'],
    },
    users: {
      type: [{ type: ObjectId, ref: 'User' }],
      validate: {
        validator: (arr: any[]) => arr.length >= 1,
        message: 'Usuários: Informe ao menos um usuário',
      },
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

setorSchema.pre('save', function () {
  if (!this._id) {
    this._id = new mongoose.Types.ObjectId()
  }
})

setorSchema.set('toJSON', {
  virtuals: true,
})

const Setor = mongoose.model('Setor', setorSchema)

export default Setor
