import mongoose from 'mongoose'

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const productSchema = new Schema(
  {
    _id: ObjectId,
    product_retailer_id: String,
    name: String,
    licensee: {
      type: ObjectId,
      ref: 'Licensee',
      required: [true, 'Licensee: Você deve preencher o campo'],
    },
  },
  { timestamps: true },
)

productSchema.pre('save', function () {
  const product = this

  if (!product._id) {
    product._id = new mongoose.Types.ObjectId()
  }
})

productSchema.set('toJSON', {
  virtuals: true,
})

const Product = mongoose.model('Product', productSchema)

export default Product
