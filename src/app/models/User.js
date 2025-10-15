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
        validator: (value) => {
          return value.length >= 4
        },
        message: (props) => `Nome: Informe um valor com mais que 4 caracteres! Atual: ${props.value}`,
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
        validator: (value) => {
          return value.length >= 8
        },
        message: 'Senha: Informe um valor com mais que 8 caracteres!',
      },
    },
    active: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
    isSuper: { type: Boolean, default: false },
    licensee: {
      type: ObjectId,
      ref: 'Licensee',
      required: [
        function () {
          return !this.isSuper
        },
        'Licensee: Você deve preencher o campo',
      ],
    },
  },
  { timestamps: true },
)

userSchema.pre('save', function (next) {
  const user = this

  if (!user._id) {
    user._id = new mongoose.Types.ObjectId()
  }

  if (!user.isModified('password')) return next()

  bcrypt.genSalt(saltRounds, (err, salt) => {
    bcrypt.hash(user.password, salt, (err, hash) => {
      user.password = hash
      next()
    })
  })
})

userSchema.methods.validPassword = async function (password) {
  return await bcrypt.compare(password, this.password)
}

userSchema.set('toJSON', {
  virtuals: true,
})

const User = mongoose.model('User', userSchema)

export default User
