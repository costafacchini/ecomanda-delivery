const FractionalProducts = require('./FractionalProducts')

describe('Fractional products', () => {
  const licensee = {
    productFractional2Name: 'Pizza Grande 2 Sabores',
    productFractional2Id: '5647',
    productFractional3Name: 'Pizza Grande 3 Sabores',
    productFractional3Id: '5699',
  }

  describe('when has no items with factional in name', () => {
    it('maitains the item as original', () => {
      const items = [
        {
          name: 'Pizza grande inteira 1',
          product_retailer_id: '1234',
          quantity: 1,
          unit_price: 80,
        },
        {
          name: 'Pizza grande inteira 2',
          product_retailer_id: '1235',
          quantity: 1,
          unit_price: 80,
        },
      ]

      const fractionalProducts = new FractionalProducts(licensee)
      const itemsParsed = fractionalProducts.join(items)

      expect(itemsParsed.length).toEqual(2)

      expect(itemsParsed[0]).toEqual({
        name: 'Pizza grande inteira 1',
        product_retailer_id: '1234',
        quantity: 1,
        unit_price: 80,
      })

      expect(itemsParsed[1]).toEqual({
        name: 'Pizza grande inteira 2',
        product_retailer_id: '1235',
        quantity: 1,
        unit_price: 80,
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
            note: '',
            product_fb_id: '',
          },
          {
            name: '1/2 Bacon com milho',
            product_retailer_id: '1235',
            quantity: 1,
            unit_price: 45,
            note: '',
            product_fb_id: '',
          },
        ]

        const fractionalProducts = new FractionalProducts(licensee)
        const itemsParsed = fractionalProducts.join(items)

        expect(itemsParsed.length).toEqual(2)

        expect(itemsParsed[1]).toEqual({
          name: 'Pizza Grande 2 Sabores',
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
              note: '',
              product_fb_id: '',
            },
            {
              product_retailer_id: '1235',
              name: '1/2 Bacon com milho',
              quantity: 1,
              unit_price: 45,
              note: '',
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
            note: '',
            product_fb_id: '',
          },
          {
            name: '1/3 Bacon com milho',
            product_retailer_id: '1235',
            quantity: 1,
            unit_price: 25,
            note: '',
            product_fb_id: '',
          },
          {
            name: '1/3 Bacon calabresa',
            product_retailer_id: '1236',
            quantity: 1,
            unit_price: 30,
            note: '',
            product_fb_id: '',
          },
        ]

        const fractionalProducts = new FractionalProducts(licensee)
        const itemsParsed = fractionalProducts.join(items)

        expect(itemsParsed.length).toEqual(2)

        expect(itemsParsed[1]).toEqual({
          name: 'Pizza Grande 3 Sabores',
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
              note: '',
              product_fb_id: '',
            },
            {
              product_retailer_id: '1235',
              name: '1/3 Bacon com milho',
              quantity: 1,
              unit_price: 25,
              note: '',
              product_fb_id: '',
            },
            {
              product_retailer_id: '1236',
              name: '1/3 Bacon calabresa',
              quantity: 1,
              unit_price: 30,
              note: '',
              product_fb_id: '',
            },
          ],
        })
      })
    })
  })
})
