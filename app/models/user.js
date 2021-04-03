const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId
const bcrypt = require('bcrypt')
const saltRounds = 14

const userSchema = new Schema({
  _id: ObjectId,
  username: String,
  email: { type: String, unique: true },
  password: String,
})

userSchema.pre('save', function (next) {
  const user = this

  if (!user._id) {
    user._id = new mongoose.Types.ObjectId()
  }

  if (!user.isModified('password')) return next()

  bcrypt.genSalt(saltRounds, function (err, salt) {
    if (err) return next(err)
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err)

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

module.exports = User
