import FractionalProducts from './FractionalProducts.js'

describe('Fractional products', () => {
  const licensee = {
    productFractionals: `{
      "products": [
        { "id": "5647", "name": "Pizza Grande (2 sabores)" },
        { "id": "5699", "name": "Pizza Grande (3 sabores)" },
        { "id": "5599", "name": "Pizza Broto" },
        { "id": "9876", "name": "Pizza Grande (4 sabores)" }
      ]
    }`,
  }

  describe('when has no items with factional in name', () => {
    describe('when the item has an id on note', () => {
      it('changes the item by product with id', () => {
        const items = [
          {
            name: 'Pizza grande inteira 1',
            product_retailer_id: '1234',
            quantity: 1,
            unit_price: 80,
            note: 'Pizza - #5599',
          },
        ]

        const fractionalProducts = new FractionalProducts(licensee)
        const itemsParsed = fractionalProducts.join(items)

        expect(itemsParsed.length).toEqual(1)

        expect(itemsParsed[0]).toEqual({
          name: 'Pizza Broto',
          product_retailer_id: '5599',
          quantity: 1,
          unit_price: 80,
          note: '',
          product_fb_id: '',
          additionals: [
            {
              product_retailer_id: '1234',
              name: 'Pizza grande inteira 1',
              quantity: 1,
              unit_price: 80,
              note: 'Pizza - #5599',
              product_fb_id: '',
            },
          ],
        })
      })
    })

    describe('when the item has no id on note', () => {
      it('maitains the item as original', () => {
        const items = [
          {
            name: 'Refrigerante 2 litros',
            product_retailer_id: '1235',
            quantity: 1,
            note: 'Guaraná 2 litros',
            unit_price: 12,
          },
        ]

        const fractionalProducts = new FractionalProducts(licensee)
        const itemsParsed = fractionalProducts.join(items)

        expect(itemsParsed.length).toEqual(1)

        expect(itemsParsed[0]).toEqual({
          name: 'Refrigerante 2 litros',
          product_retailer_id: '1235',
          quantity: 1,
          unit_price: 12,
          note: 'Guaraná 2 litros',
        })
      })
    })
  })

  describe('when has item with fractional in name', () => {
    describe('when its a half', () => {
      it('joins the items', () => {
        const items = [
          {
            name: 'Pizza grande inteira 1',
            product_retailer_id: '1234',
            quantity: 1,
            unit_price: 80,
          },
          {
            name: '1/2 Frango com catupiry',
            product_retailer_id: '1234',
            quantity: 1,
            unit_price: 40,
            note: 'Pizza - #5647',
            product_fb_id: '',
          },
          {
            name: '1/2 Bacon com milho',
            product_retailer_id: '1235',
            quantity: 1,
            unit_price: 45,
            note: 'Pizza - #5647',
            product_fb_id: '',
          },
        ]

        const fractionalProducts = new FractionalProducts(licensee)
        const itemsParsed = fractionalProducts.join(items)

        expect(itemsParsed.length).toEqual(2)

        expect(itemsParsed[1]).toEqual({
          name: 'Pizza Grande (2 sabores)',
          product_retailer_id: '5647',
          quantity: 1,
          unit_price: 85,
          note: '',
          product_fb_id: '',
          additionals: [
            {
              product_retailer_id: '1234',
              name: '1/2 Frango com catupiry',
              quantity: 1,
              unit_price: 40,
              note: 'Pizza - #5647',
              product_fb_id: '',
            },
            {
              product_retailer_id: '1235',
              name: '1/2 Bacon com milho',
              quantity: 1,
              unit_price: 45,
              note: 'Pizza - #5647',
              product_fb_id: '',
            },
          ],
        })
      })
    })

    describe('when its a one third', () => {
      it('joins the items', () => {
        const items = [
          {
            name: 'Pizza grande inteira 1',
            product_retailer_id: '1234',
            quantity: 1,
            unit_price: 80,
          },
          {
            name: '1/3 Frango com catupiry',
            product_retailer_id: '1234',
            quantity: 1,
            unit_price: 20,
            note: 'Pizza - #5699',
            product_fb_id: '',
          },
          {
            name: '1/3 Bacon com milho',
            product_retailer_id: '1235',
            quantity: 1,
            unit_price: 25,
            note: 'Pizza - #5699',
            product_fb_id: '',
          },
          {
            name: '1/3 Bacon calabresa',
            description: 'Pizza - 5699',
            product_retailer_id: '1236',
            quantity: 1,
            unit_price: 30,
            note: 'Pizza - #5699',
            product_fb_id: '',
          },
        ]

        const fractionalProducts = new FractionalProducts(licensee)
        const itemsParsed = fractionalProducts.join(items)

        expect(itemsParsed.length).toEqual(2)

        expect(itemsParsed[1]).toEqual({
          name: 'Pizza Grande (3 sabores)',
          product_retailer_id: '5699',
          quantity: 1,
          unit_price: 75,
          note: '',
          product_fb_id: '',
          additionals: [
            {
              product_retailer_id: '1234',
              name: '1/3 Frango com catupiry',
              quantity: 1,
              unit_price: 20,
              note: 'Pizza - #5699',
              product_fb_id: '',
            },
            {
              product_retailer_id: '1235',
              name: '1/3 Bacon com milho',
              quantity: 1,
              unit_price: 25,
              note: 'Pizza - #5699',
              product_fb_id: '',
            },
            {
              product_retailer_id: '1236',
              name: '1/3 Bacon calabresa',
              quantity: 1,
              unit_price: 30,
              note: 'Pizza - #5699',
              product_fb_id: '',
            },
          ],
        })
      })
    })

    describe('when its a quarter', () => {
      it('joins the items', () => {
        const items = [
          {
            name: 'Pizza grande inteira 1',
            product_retailer_id: '1234',
            quantity: 1,
            unit_price: 80,
          },
          {
            name: '1/4 Frango com catupiry',
            product_retailer_id: '1234',
            quantity: 1,
            unit_price: 20,
            note: 'Pizza - #9876',
            product_fb_id: '',
          },
          {
            name: '1/4 Bacon com milho',
            product_retailer_id: '1235',
            quantity: 1,
            unit_price: 25,
            note: 'Pizza - #9876',
            product_fb_id: '',
          },
          {
            name: '1/4 Bacon calabresa',
            product_retailer_id: '1236',
            quantity: 1,
            unit_price: 30,
            note: 'Pizza - #9876',
            product_fb_id: '',
          },
          {
            name: '1/4 Calabresa',
            product_retailer_id: '1299',
            quantity: 1,
            unit_price: 30,
            note: 'Pizza - #9876',
            product_fb_id: '',
          },
        ]

        const fractionalProducts = new FractionalProducts(licensee)
        const itemsParsed = fractionalProducts.join(items)

        expect(itemsParsed.length).toEqual(2)

        expect(itemsParsed[1]).toEqual({
          name: 'Pizza Grande (4 sabores)',
          product_retailer_id: '9876',
          quantity: 1,
          unit_price: 105,
          note: '',
          product_fb_id: '',
          additionals: [
            {
              product_retailer_id: '1234',
              name: '1/4 Frango com catupiry',
              quantity: 1,
              unit_price: 20,
              note: 'Pizza - #9876',
              product_fb_id: '',
            },
            {
              product_retailer_id: '1235',
              name: '1/4 Bacon com milho',
              quantity: 1,
              unit_price: 25,
              note: 'Pizza - #9876',
              product_fb_id: '',
            },
            {
              product_retailer_id: '1236',
              name: '1/4 Bacon calabresa',
              quantity: 1,
              unit_price: 30,
              note: 'Pizza - #9876',
              product_fb_id: '',
            },
            {
              product_retailer_id: '1299',
              name: '1/4 Calabresa',
              quantity: 1,
              unit_price: 30,
              note: 'Pizza - #9876',
              product_fb_id: '',
            },
          ],
        })
      })
    })
  })
})
