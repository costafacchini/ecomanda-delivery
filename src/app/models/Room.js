import mongoose from 'mongoose'

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const roomSchema = new Schema(
  {
    _id: ObjectId,
    roomId: String,
    token: String,
    closed: { type: Boolean, default: false },
    contact: {
      type: ObjectId,
      ref: 'Contact',
      required: [true, 'Contato: Você deve preencher o campo'],
    },
  },
  { timestamps: true },
)

roomSchema.pre('save', function (next) {
  const room = this

  if (!room._id) {
    room._id = new mongoose.Types.ObjectId()
  }

  next()
})

roomSchema.set('toJSON', {
  virtuals: true,
})

const Room = mongoose.model('Room', roomSchema)

export default Room
