import mongoose from 'mongoose'

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const roomSchema = new Schema(
  {
    _id: ObjectId,
    roomId: String,
    token: String,
    closed: { type: Boolean, default: false },
    closedAt: { type: Date },
    contact: {
      type: ObjectId,
      ref: 'Contact',
      required: [true, 'Contato: Você deve preencher o campo'],
    },
    agent: {
      type: ObjectId,
      ref: 'User',
      default: null,
    },
    department: {
      type: ObjectId,
      ref: 'Department',
      default: null,
    },
    inbox: {
      type: ObjectId,
      ref: 'Inbox',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'open', 'closed'],
      default: 'pending',
    },
  },
  { timestamps: true },
)

roomSchema.pre('save', function () {
  const room = this

  if (!room._id) {
    room._id = new mongoose.Types.ObjectId()
  }

  if (room.isModified('status')) {
    if (room.status === 'closed') {
      room.closed = true
      if (!room.closedAt) room.closedAt = new Date()
    } else {
      room.closed = false
      room.closedAt = undefined
    }
  }

  if (room.isModified('closed') && !room.isModified('status')) {
    room.status = room.closed ? 'closed' : 'open'
  }
})

roomSchema.set('toJSON', {
  virtuals: true,
})

const Room = mongoose.model('Room', roomSchema)

export default Room
