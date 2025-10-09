import Alloy from './Alloy.js'
import { licensee as licenseeFactory   } from '@factories/licensee.js'
import { contact as contactFactory   } from '@factories/contact.js'

describe('Alloy plugin', () => {
  describe('#parseCart', () => {
    it('returns the cart normalized from plugin format', () => {
      const licensee = licenseeFactory.build({ unidadeId: '123', statusId: '743' })

      const contact = contactFactory.build({
        licensee,
        plugin_cart_id: '929787465',
        name: 'John Doe',
        email: 'john@doe.com',
        uf: 'SP',
        city: 'Santos',
        neighborhood: 'Centro',
        address: 'Rua dos Bobos',
        address_number: '123',
        address_complement: 'Sala 1',
        cep: '12345-678',
      })

      const cartDefault = {
        itens: [
          {
            quantidade: 1,
            obs: '',
            valor: 54.99,
            id_alloy: '40784',
            nome: 'Combo Pollo Loko',
            descricao: '',
            valor_desconto: 0,
            complementos: [
              {
                quantidade: 2,
                valor: 0,
                id_alloy: '98783',
                nome: 'Molho Barbecue',
                descricao: '',
              },
              {
                quantidade: 2,
                valor: 0,
                id_alloy: '98784',
                nome: 'Molho de Alho',
                descricao: '',
              },
            ],
          },
          {
            quantidade: 1,
            obs: '',
            valor: 38.99,
            id_alloy: '40786',
            nome: 'Meia porção Combo Pollo Fit',
            descricao: '',
            valor_desconto: 0,
            complementos: [
              {
                quantidade: 2,
                valor: 0,
                id_alloy: '98786',
                nome: 'Molhos Mostarda e Mel',
                descricao: '',
              },
            ],
          },
          {
            quantidade: 1,
            obs: '',
            valor: 15.99,
            id_alloy: '40750',
            nome: 'Coca-Cola Original 2lt',
            descricao: '',
            valor_desconto: 0,
          },
        ],
      }

      const pluginDefault = new Alloy()
      const cart = pluginDefault.parseCart(licensee, contact, cartDefault)

      expect(cart.concluded).toEqual(false)
      expect(cart.contact).toEqual(contact._id)
      expect(cart.licensee).toEqual(licensee._id)
      expect(cart.latitude).toEqual('')
      expect(cart.longitude).toEqual('')
      expect(cart.location).toEqual('')
      expect(cart.documento).toEqual('')
      expect(cart.delivery_method).toEqual('')
      expect(cart.payment_method).toEqual('')

      expect(cart.products.length).toEqual(3)
      expect(cart.products[0].product_retailer_id).toEqual('40784')
      expect(cart.products[0].name).toEqual('Combo Pollo Loko')
      expect(cart.products[0].quantity).toEqual(1)
      expect(cart.products[0].unit_price).toEqual(54.99)

      expect(cart.products[0].additionals.length).toEqual(2)
      expect(cart.products[0].additionals[0].name).toEqual('Molho Barbecue')
      expect(cart.products[0].additionals[0].quantity).toEqual(2)
      expect(cart.products[0].additionals[0].unit_price).toEqual(0)
      expect(cart.products[0].additionals[0].product_retailer_id).toEqual('98783')

      expect(cart.products[0].additionals[1].name).toEqual('Molho de Alho')
      expect(cart.products[0].additionals[1].quantity).toEqual(2)
      expect(cart.products[0].additionals[1].unit_price).toEqual(0)
      expect(cart.products[0].additionals[1].product_retailer_id).toEqual('98784')

      expect(cart.products[1].product_retailer_id).toEqual('40786')
      expect(cart.products[1].name).toEqual('Meia porção Combo Pollo Fit')
      expect(cart.products[1].quantity).toEqual(1)
      expect(cart.products[1].unit_price).toEqual(38.99)

      expect(cart.products[1].additionals.length).toEqual(1)
      expect(cart.products[1].additionals[0].name).toEqual('Molhos Mostarda e Mel')
      expect(cart.products[1].additionals[0].quantity).toEqual(2)
      expect(cart.products[1].additionals[0].unit_price).toEqual(0)
      expect(cart.products[1].additionals[0].product_retailer_id).toEqual('98786')

      expect(cart.products[2].product_retailer_id).toEqual('40750')
      expect(cart.products[2].name).toEqual('Coca-Cola Original 2lt')
      expect(cart.products[2].quantity).toEqual(1)
      expect(cart.products[2].unit_price).toEqual(15.99)
    })
  })
})
