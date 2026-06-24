import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId
const saltRounds = 14

const userSchema = new Schema(
  {
    _id: ObjectId,
    name: {
      type: String,
      required: [true, 'Nome: Você deve preencher o campo'],
      validate: {
        validator: (value: any) => {
          return value.length >= 4
        },
        message: (props: any) => `Nome: Informe um valor com mais que 4 caracteres! Atual: ${props.value}`,
      },
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'Email: Você deve preencher o campo'],
    },
    password: {
      type: String,
      validate: {
        validator: (value: any) => {
          return value.length >= 8
        },
        message: 'Senha: Informe um valor com mais que 8 caracteres!',
      },
    },
    active: { type: Boolean, default: true },
    role: {
      type: String,
      enum: ['agent', 'supervisor', 'admin', 'super'],
      default: 'agent',
    },
    language: {
      type: String,
      enum: ['pt', 'en'],
      default: 'pt',
    },
    licensee: {
      type: ObjectId,
      ref: 'Licensee',
      required: [
        function (this: any) {
          return !['admin', 'super'].includes(this.role)
        },
        'Licensee: Você deve preencher o campo',
      ],
    },
    blockedLicensees: {
      type: [{ type: ObjectId, ref: 'Licensee' }],
      default: [],
    },
  },
  { timestamps: true },
)

userSchema.pre('save', async function (this: any) {
  if (!this._id) {
    this._id = new mongoose.Types.ObjectId()
  }

  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password as string, saltRounds)
  }
})

userSchema.methods.validPassword = async function (password: any) {
  return await bcrypt.compare(password, this.password)
}

userSchema.set('toJSON', {
  virtuals: true,
})

const User = mongoose.model('User', userSchema)

export default User
