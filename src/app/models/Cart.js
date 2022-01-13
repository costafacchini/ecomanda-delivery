const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const detailSchema = new Schema({
  name: String,
  quantity: Number,
  unit_price: Number,
})

const additionalSchema = new Schema({
  name: String,
  quantity: Number,
  unit_price: Number,
  details: [detailSchema],
})

const productsSchema = new Schema({
  product_retailer_id: String,
  name: String,
  quantity: Number,
  unit_price: Number,
  additionals: [additionalSchema],
})

const cartSchema = new Schema(
  {
    _id: ObjectId,
    delivery_tax: {
      type: Number,
      default: 0,
    },
    contact: {
      type: ObjectId,
      ref: 'Contact',
      required: [true, 'Contact: Você deve preencher o campo'],
    },
    licensee: {
      type: ObjectId,
      ref: 'Licensee',
      required: [true, 'Licensee: Você deve preencher o campo'],
    },
    products: [productsSchema],
    total: {
      type: Number,
      default: 0,
    },
    concluded: { type: Boolean, default: false },
    catalog: String,
    address: String,
    address_number: String,
    address_complement: String,
    neighborhood: String,
    city: String,
    cep: String,
    uf: String,
    note: String,
  },
  { timestamps: true }
)

cartSchema.pre('save', function (next) {
  const cart = this

  if (!cart._id) {
    cart._id = new mongoose.Types.ObjectId()
  }

  cart.total = cart.calculateTotal()

  next()
})

cartSchema.set('toJSON', {
  virtuals: true,
})

cartSchema.methods.calculateTotal = function () {
  const cart = this

  return cart.products?.reduce((summaryProducts, product) => {
    const additionalsTotal =
      product.additionals?.reduce((summaryAdditionals, additional) => {
        const detailsTotal =
          additional.details?.reduce((summaryDetails, detail) => {
            return summaryDetails + detail.unit_price * detail.quantity
          }, 0) || 0

        return summaryAdditionals + (detailsTotal + additional.unit_price) * additional.quantity
      }, 0) || 0

    return summaryProducts + (product.unit_price + additionalsTotal) * product.quantity
  }, cart.delivery_tax || 0)
}

cartSchema.methods.calculateTotalItem = function (item) {
  const additionalsTotal =
    item.additionals?.reduce((summaryAdditionals, additional) => {
      const detailsTotal =
        additional.details?.reduce((summaryDetails, detail) => {
          return summaryDetails + detail.unit_price * detail.quantity
        }, 0) || 0

      return summaryAdditionals + (detailsTotal + additional.unit_price) * additional.quantity
    }, 0) || 0

  return (item.unit_price + additionalsTotal) * item.quantity
}

const Cart = mongoose.model('Cart', cartSchema)

module.exports = Cart
