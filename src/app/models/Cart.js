const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const valoresSchema = new Schema({
  nome: String,
  quantidade: Number,
  valor: Number,
})

const atributosSchema = new Schema({
  nome: String,
  quantidade: Number,
  valor: Number,
  valores: valoresSchema,
})

const produtosSchema = new Schema({
  nome: String,
  quantidade: Number,
  valor: Number,
  atributos: [atributosSchema],
})

const cartSchema = new Schema(
  {
    _id: ObjectId,
    loja: String,
    cliente_id: String,
    entrega: Number,
    produtos: [produtosSchema],
    total: Number,
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
)

cartSchema.pre('save', function (next) {
  const cart = this

  if (!cart._id) {
    cart._id = new mongoose.Types.ObjectId()
  }

  next()
})

cartSchema.set('toJSON', {
  virtuals: true,
})

const Cart = mongoose.model('Cart', cartSchema)

module.exports = Cart
