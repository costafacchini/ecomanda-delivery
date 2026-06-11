import mongoose from 'mongoose'

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const sectorSchema = new Schema(
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

sectorSchema.pre('save', function () {
  if (!this._id) {
    this._id = new mongoose.Types.ObjectId()
  }
})

sectorSchema.set('toJSON', {
  virtuals: true,
})

const Sector = mongoose.model('Sector', sectorSchema)

export default Sector
