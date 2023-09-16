const Go2go = require('./Go2go')
const Contact = require('@models/Contact')
const Licensee = require('@models/Licensee')
const mongoServer = require('../../../../.jest/utils')
const Cart = require('@models/Cart')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')
const { cart: cartFactory } = require('@factories/cart')
const { advanceTo, clear } = require('jest-date-mock')

describe('Go2go plugin', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
    advanceTo(new Date('2021-01-05T10:25:47.000Z'))
  })

  afterEach(async () => {
    await mongoServer.disconnect()
    clear()
  })

  describe('#transformCart', () => {
    it('returns the cart transformed in plugin format', async () => {
      const licensee = await Licensee.create(licenseeFactory.build({ unidadeId: '123', statusId: '743' }))

      const contact = await Contact.create(
        contactFactory.build({
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
        }),
      )

      const cart = await Cart.create(cartFactory.build({ contact, licensee, delivery_tax: 3.5, note: 'without onion' }))

      const go2go = new Go2go()
      const cartTransformed = await go2go.transformCart(licensee, cart._id)

      expect(cartTransformed.order.unidadeId).toEqual('123')
      expect(cartTransformed.order.origemId).toEqual(0)
      expect(cartTransformed.order.deliveryMode).toEqual('MERCHANT')
      expect(cartTransformed.order.refPedido).toEqual('Ecommerce')
      expect(cartTransformed.order.refOrigem).toEqual('Ecommerce')
      expect(cartTransformed.order.refCurtaOrigem).toEqual('')
      expect(cartTransformed.order.docNotaFiscal).toEqual(false)
      expect(cartTransformed.order.valorDocNotaFiscal).toEqual('')
      expect(cartTransformed.order.clienteId).toEqual('929787465')
      expect(cartTransformed.order.nomeCliente).toEqual('John Doe')
      expect(cartTransformed.order.statusId).toEqual('743')
      expect(cartTransformed.order.endEntrega).toEqual('')
      expect(cartTransformed.order.dataPedido).toEqual('2021-01-05T10:25:47.000Z')
      expect(cartTransformed.order.email).toEqual('john@doe.com')
      expect(cartTransformed.order.subTotal).toEqual(15.600000000000001)
      expect(cartTransformed.order.impostos).toEqual(0)
      expect(cartTransformed.order.voucher).toEqual(0)
      expect(cartTransformed.order.dataEntrega).toEqual('2021-01-05T10:25:47.000Z')
      expect(cartTransformed.order.taxaEntrega).toEqual(3.5)
      expect(cartTransformed.order.totalPedido).toEqual(19.1)
      expect(cartTransformed.order.observacoesGerais).toEqual('without onion')
      expect(cartTransformed.order.documento).toEqual('')
      expect(cartTransformed.order.flagIntegrado).toEqual('NaoIntegrado')
      expect(cartTransformed.order.valorPagar).toEqual(19.1)
      expect(cartTransformed.order.telefonePedido).toEqual('5511990283745')
      expect(cartTransformed.order.pagamentos[0].tipo).toEqual('')
      expect(cartTransformed.order.pagamentos[0].valor).toEqual(19.1)
      expect(cartTransformed.order.pagamentos[0].observacao).toEqual('')
      expect(cartTransformed.order.pagamentos[0].codigoResposta).toEqual('')
      expect(cartTransformed.order.pagamentos[0].bandeira).toEqual(0)
      expect(cartTransformed.order.pagamentos[0].troco).toEqual(0)
      expect(cartTransformed.order.pagamentos[0].nsu).toEqual(0)
      expect(cartTransformed.order.pagamentos[0].status).toEqual('NaoInformado')
      expect(cartTransformed.order.pagamentos[0].descontoId).toEqual(0)
      expect(cartTransformed.order.pagamentos[0].prePago).toEqual(false)
      expect(cartTransformed.order.pagamentos[0].transactionId).toEqual(0)
      expect(cartTransformed.order.entrega.retiraLoja).toEqual(false)
      expect(cartTransformed.order.entrega.data).toEqual('')
      expect(cartTransformed.order.entrega.retirada).toEqual('Hoje')
      expect(cartTransformed.order.entrega.endereco.id).toEqual(37025)
      expect(cartTransformed.order.entrega.endereco.pais).toEqual('Brasil')
      expect(cartTransformed.order.entrega.endereco.uf).toEqual('SP')
      expect(cartTransformed.order.entrega.endereco.cidade).toEqual('Santos')
      expect(cartTransformed.order.entrega.endereco.bairro).toEqual('Centro')
      expect(cartTransformed.order.entrega.endereco.logradouro).toEqual('Rua dos Bobos')
      expect(cartTransformed.order.entrega.endereco.numero).toEqual('123')
      expect(cartTransformed.order.entrega.endereco.complemento).toEqual('Sala 1')
      expect(cartTransformed.order.entrega.endereco.cep).toEqual('12345678')
      expect(cartTransformed.order.entrega.endereco.padrao).toEqual(false)
      expect(cartTransformed.order.itens.length).toEqual(1)
      expect(cartTransformed.order.itens[0].produtoId).toEqual('0123')
      expect(cartTransformed.order.itens[0].quantidade).toEqual(2)
      expect(cartTransformed.order.itens[0].precoTotal).toEqual(7.8)
      expect(cartTransformed.order.itens[0].adicionalPedidoItems[0].produtoId).toEqual('Additional 1')
      expect(cartTransformed.order.itens[0].adicionalPedidoItems[0].atributoValorId).toEqual('Detail 1')
      expect(cartTransformed.order.itens[0].adicionalPedidoItems[0].quantidade).toEqual(1)
      expect(cartTransformed.order.itens[0].adicionalPedidoItems[0].precoTotal).toEqual(0.5)
    })
  })
})
