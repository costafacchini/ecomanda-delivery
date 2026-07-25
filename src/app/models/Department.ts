import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const departmentSchema = new Schema(
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
    departmentToken: { type: String, unique: true, default: uuidv4 },
    inbox: { type: ObjectId, ref: 'Inbox', default: null },
  },
  { timestamps: true },
)

departmentSchema.pre('save', function () {
  if (!this._id) {
    this._id = new mongoose.Types.ObjectId()
  }
})

departmentSchema.virtual('webhookUrl').get(function () {
  if (!this.populated('licensee')) return null
  return `https://clave-digital.herokuapp.com/api/v1/messenger/message/?token=${(this.licensee as any).apiToken}&department=${this.departmentToken}`
})

departmentSchema.set('toJSON', {
  virtuals: true,
})

const Department = mongoose.model('Department', departmentSchema)

export default Department
