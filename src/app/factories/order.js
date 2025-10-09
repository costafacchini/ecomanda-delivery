import { Factory  } from 'fishery'
import { licensee  } from './licensee.js'
import moment from 'moment'

const order = Factory.define(() => ({
  merchant_external_code: '358b9068-34cf-4f96-b883-0d8192bc12dd',
  order_external_id: '9967816',
  type: 'TAKEOUT',
  display_id: '1#9967816',
  status: 'CONFIRMED',
  customer_information: {
    id: '14246',
    name: 'Anderson Felizari',
    phone: '47988044298',
    document: '05798820980',
  },
  total_items: 5,
  total_fees: 3,
  total_discount: 2,
  total_addition: 1,
  total: 7,
  payments: {
    pending: 7,
    prepaid: 0,
    methods: [
      {
        value: 7,
        type: 'PENDING',
        method: 'CASH',
      },
    ],
  },
  takeout: {
    mode: 'DEFAULT',
    takeout_minutes: 25,
  },
  items: [
    {
      id: '17628924',
      product_id: '280089',
      name: 'Refrigerante 600ml',
      unit: 'UNIT',
      description: 'Coca-Cola',
      quantity: 1,
      unit_price: 5,
      total_price: 5,
      option_groups: [
        {
          id: '27652021',
          group_id: 'I392901',
          name: 'Bebida',
          define_value: true,
          options: [
            {
              id: '52007400',
              option_id: 'I981750',
              name: 'Coca-Cola',
              unit: 'UNIT',
              quantity: 1,
              total: 5,
            },
          ],
        },
      ],
    },
  ],
  licensee: licensee.build(),
  integration_status: 'done',
  createdAt: moment('2021-07-03T00:00:00-03:00').toDate(),
}))

export default { order }
