import mongoose from 'mongoose'

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const triggerSchema = new Schema(
  {
    _id: ObjectId,
    name: String,
    triggerKind: {
      type: String,
      enum: ['multi_product', 'single_product', 'reply_button', 'list_message', 'text'],
      required: [true, 'Tipo de Gatilho: Você deve informar um valor ( catalog | summary )'],
    },
    expression: {
      type: String,
      required: [true, 'Expressão: Você deve preencher o campo'],
    },
    catalogId: {
      type: String,
      required: [
        function () {
          return this.triggerKind === 'multi_product'
        },
        'Id Catalogo: deve ser preenchido quando o gatilho é do tipo vários produtos',
      ],
    },
    catalogMulti: {
      type: String,
      required: [
        function () {
          return this.triggerKind === 'multi_product'
        },
        'Catalogo: deve ser preenchido quando o gatilho é do tipo vários produtos',
      ],
    },
    catalogSingle: {
      type: String,
      required: [
        function () {
          return this.triggerKind === 'single_product'
        },
        'Catalogo: deve ser preenchido quando o gatilho é do tipo produto único',
      ],
    },
    textReplyButton: {
      type: String,
      required: [
        function () {
          return this.triggerKind === 'reply_button'
        },
        'Script: deve ser preenchido quando o gatilho é do tipo botões de resposta',
      ],
    },
    messagesList: {
      type: String,
      required: [
        function () {
          return this.triggerKind === 'list_message'
        },
        'Mensagens: deve ser preenchido quando o gatilho é do tipo lista de mensagens',
      ],
    },
    text: {
      type: String,
      required: [
        function () {
          return this.triggerKind === 'text'
        },
        'Texto: deve ser preenchido quando o gatilho é do tipo texto',
      ],
    },
    licensee: {
      type: ObjectId,
      ref: 'Licensee',
      required: [true, 'Licensee: Você deve preencher o campo'],
    },
    order: {
      type: Number,
      default: 1,
      required: [true, 'Ordem: Você deve preencher o campo'],
    },
  },
  { timestamps: true },
)

triggerSchema.pre('save', function () {
  const trigger = this

  if (!trigger._id) {
    trigger._id = new mongoose.Types.ObjectId()
  }
})

triggerSchema.set('toJSON', {
  virtuals: true,
})

const Trigger = mongoose.model('Trigger', triggerSchema)

export default Trigger
