const { Factory } = require('fishery')
const { licensee } = require('./licensee')
const { contact } = require('./contact')

const cart = Factory.define(() => ({
  products: [
    {
      product_retailer_id: '0123',
      name: 'Product 1',
      quantity: 2,
      unit_price: 7.8,
      additionals: [
        {
          name: 'Additional 1',
          quantity: 1,
          unit_price: 0.5,
          details: [
            {
              name: 'Detail 1',
              quantity: 1,
              unit_price: 0.6,
            },
          ],
        },
      ],
    },
  ],
  concluded: false,
  delivery_tal: 0.5,
  contact: contact.build(),
  licensee: licensee.build(),
  createdAt: new Date(2021, 6, 3, 0, 0, 0),
}))

module.exports = { cart }
