import mongoose from 'mongoose'

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const customerInformationSchema = new Schema({
  id: String,
  name: String,
  phone: String,
  document: String,
})

const otherFeesSchema = new Schema({
  type: String,
  price: {
    type: Number,
    default: 0,
  },
})

const paymentMethodSchema = new Schema({
  value: {
    type: Number,
    default: 0,
  },
  type: String,
  method: String,
})

const paymentsSchema = new Schema({
  pending: {
    type: Number,
    default: 0,
  },
  prepaid: {
    type: Number,
    default: 0,
  },
  methods: [paymentMethodSchema],
})

const takeoutSchema = new Schema({
  mode: String,
  takeout_minutes: {
    type: Number,
    default: 0,
  },
})

const optionSchema = new Schema({
  id: String,
  option_id: String,
  name: String,
  unit: String,
  quantity: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
})

const optionGroupsSchema = new Schema({
  id: String,
  group_id: String,
  name: String,
  define_value: {
    type: Boolean,
    default: false,
  },
  options: [optionSchema],
})

const itensSchema = new Schema({
  id: String,
  product_id: String,
  name: String,
  external_code: String,
  unit: String,
  description: String,
  quantity: {
    type: Number,
    default: 0,
  },
  unit_price: {
    type: Number,
    default: 0,
  },
  total_price: {
    type: Number,
    default: 0,
  },
  option_groups: [optionGroupsSchema],
})

const orderSchema = new Schema(
  {
    _id: ObjectId,
    merchant_external_code: String,
    order_external_id: String,
    type: String,
    display_id: String,
    status: String,
    customer_information: customerInformationSchema,
    otherFees: [otherFeesSchema],
    total_items: {
      type: Number,
      default: 0,
    },
    total_fees: {
      type: Number,
      default: 0,
    },
    total_discount: {
      type: Number,
      default: 0,
    },
    total_addition: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    payments: paymentsSchema,
    takeout: takeoutSchema,
    items: [itensSchema],
    licensee: {
      type: ObjectId,
      ref: 'Licensee',
      required: [true, 'Licensee: Você deve preencher o campo'],
    },
    payload: {
      type: Object,
    },
    integration_id: String,
    integration_status: {
      type: String,
      enum: ['pending', 'done', 'error'],
    },
    integration_error: String,
  },
  { timestamps: true },
)

orderSchema.pre('save', function () {
  const order = this

  if (!order._id) {
    order._id = new mongoose.Types.ObjectId()
  }
})

orderSchema.set('toJSON', {
  virtuals: true,
})

const Order = mongoose.model('Order', orderSchema)

export default Order
