import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const WHATSAPP_DEFAULT_VALUES = ['utalk', 'dialog', 'ycloud', 'pabbly', 'baileys', ''] as const
const CHAT_DEFAULT_VALUES = ['rocketchat', 'crisp', 'cuboup', 'chatwoot', 'local', ''] as const
const KIND_VALUES = ['messenger', 'chat'] as const

const inboxSchema = new Schema(
  {
    _id: ObjectId,
    name: {
      type: String,
      required: [true, 'Nome: Você deve preencher o campo'],
      trim: true,
    },
    licensee: {
      type: ObjectId,
      ref: 'Licensee',
      required: [true, 'Licensee: Você deve preencher o campo'],
    },
    kind: {
      type: String,
      enum: KIND_VALUES,
      required: [true, 'Kind: Você deve preencher o campo'],
    },
    whatsappDefault: {
      type: String,
      enum: WHATSAPP_DEFAULT_VALUES,
      default: '',
    },
    whatsappToken: { type: String },
    whatsappUrl: { type: String },
    chatDefault: {
      type: String,
      enum: CHAT_DEFAULT_VALUES,
      default: '',
    },
    chatUrl: { type: String },
    chatKey: { type: String },
    chatIdentifier: { type: String },
    inboxToken: { type: String, unique: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

inboxSchema.pre('validate', function () {
  if (!this._id) {
    this._id = new mongoose.Types.ObjectId()
  }
  if (!this.inboxToken) {
    this.inboxToken = uuidv4()
  }
})

// webhookUrl is only meaningful for messenger kind inboxes.
// Returns null when licensee is not populated to prevent empty URLs leaking.
inboxSchema.virtual('webhookUrl').get(function () {
  if (this.kind !== 'messenger') return null
  if (!this.populated('licensee')) return null
  return `/api/v1/messenger/message/?token=${(this.licensee as any).apiToken}&inbox=${this.inboxToken}`
})

inboxSchema.set('toJSON', {
  virtuals: true,
})

const Inbox = mongoose.model('Inbox', inboxSchema)

export default Inbox
