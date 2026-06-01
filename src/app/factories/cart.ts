import { Factory } from 'fishery'
import { licensee } from './licensee'
import { contact } from './contact'
import moment from 'moment'

const cart = Factory.define(() => ({
  products: [
    {
      product_retailer_id: '0123',
      product_fb_id: 'fb_id',
      name: 'Product 1',
      quantity: 2,
      unit_price: 7.8,
      note: 'item note',
      additionals: [
        {
          product_retailer_id: '9876',
          product_fb_id: 'ad fb_id',
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
  delivery_tax: 0.5,
  contact: contact.build(),
  licensee: licensee.build(),
  documento: '929787465',
  location: 'next to avenue',
  latitude: '-211211',
  longitude: '12311',
  delivery_method: 'delivery',
  payment_method: '0',
  payment_status: 'waiting',
  integration_status: 'pending',
  createdAt: moment('2021-07-03T00:00:00-03:00').toDate(),
}))

export { cart }
