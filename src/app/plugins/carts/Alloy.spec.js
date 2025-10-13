import { Alloy } from './Alloy.js'
import mongoServer from '../../../../.jest/utils'
import { advanceTo, clear } from 'jest-date-mock'
import { licensee as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { cart as cartFactory } from '@factories/cart'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { ContactRepositoryDatabase } from '@repositories/contact'
import { CartRepositoryDatabase } from '@repositories/cart'

describe('Alloy plugin', () => {
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
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build({ unidadeId: '123', statusId: '743' }))

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(
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

      const cartRepository = new CartRepositoryDatabase()
      const cart = await cartRepository.create(
        cartFactory.build({ contact, licensee, delivery_tax: 3.5, note: 'without onion' }),
      )

      const go2go = new Alloy()
      const cartTransformed = await go2go.transformCart(licensee, cart._id)

      expect(cartTransformed.order.provedor).toEqual('')
      expect(cartTransformed.order.id_externo).toEqual(cart._id)
      expect(cartTransformed.order.dados.pedido.obs).toEqual('without onion')
      expect(cartTransformed.order.dados.pedido.data_agendamento).toEqual('')
      expect(cartTransformed.order.dados.pedido.meio_de_entrega).toEqual('delivery')
      expect(cartTransformed.order.dados.pedido.cpf_cnpj).toEqual('929787465')
      expect(cartTransformed.order.dados.pedido.agendamento).toEqual(0)
      expect(cartTransformed.order.dados.pedido.numero_de_pessoas).toEqual(0)
      expect(cartTransformed.order.dados.pedido.itens.length).toEqual(1)
      expect(cartTransformed.order.dados.pedido.itens[0].quantidade).toEqual(2)
      expect(cartTransformed.order.dados.pedido.itens[0].obs).toEqual('item note')
      expect(cartTransformed.order.dados.pedido.itens[0].valor).toEqual(7.8)
      expect(cartTransformed.order.dados.pedido.itens[0].id_alloy).toEqual('0123')
      expect(cartTransformed.order.dados.pedido.itens[0].id_externo).toEqual('fb_id')
      expect(cartTransformed.order.dados.pedido.itens[0].nome).toEqual('Product 1')
      expect(cartTransformed.order.dados.pedido.itens[0].descricao).toEqual('')
      expect(cartTransformed.order.dados.pedido.itens[0].valor_desconto).toEqual(0)
      expect(cartTransformed.order.dados.pedido.itens[0].complementos[0].quantidade).toEqual(1)
      expect(cartTransformed.order.dados.pedido.itens[0].complementos[0].valor).toEqual(0.5)
      expect(cartTransformed.order.dados.pedido.itens[0].complementos[0].id_alloy).toEqual('9876')
      expect(cartTransformed.order.dados.pedido.itens[0].complementos[0].id_externo).toEqual('ad fb_id')
      expect(cartTransformed.order.dados.pedido.itens[0].complementos[0].nome).toEqual('Additional 1')
      expect(cartTransformed.order.dados.pedido.itens[0].complementos[0].descricao).toEqual('Detail 1')
      expect(cartTransformed.order.dados.pagamento[0].forma_de_pagamento).toEqual(0)
      expect(cartTransformed.order.dados.pagamento[0].total).toEqual(19.1)
      expect(cartTransformed.order.dados.pagamento[0].troco_para).toEqual(0)
      expect(cartTransformed.order.dados.valores_entrega.valor_entrega).toEqual(3.5)
      expect(cartTransformed.order.dados.valores_entrega.valor_desconto_entrega).toEqual(0)
      expect(cartTransformed.order.dados.endereco_de_entrega.logradouro).toEqual('Rua dos Bobos')
      expect(cartTransformed.order.dados.endereco_de_entrega.numero).toEqual('123')
      expect(cartTransformed.order.dados.endereco_de_entrega.complemento).toEqual('Sala 1')
      expect(cartTransformed.order.dados.endereco_de_entrega.referencia).toEqual('next to avenue')
      expect(cartTransformed.order.dados.endereco_de_entrega.bairro).toEqual('Centro')
      expect(cartTransformed.order.dados.endereco_de_entrega.cep).toEqual('12345678')
      expect(cartTransformed.order.dados.endereco_de_entrega.cidade).toEqual('Santos')
      expect(cartTransformed.order.dados.endereco_de_entrega.uf).toEqual('SP')
      expect(cartTransformed.order.dados.endereco_de_entrega.coordenadas_cliente).toEqual('-211211, 12311')
      expect(cartTransformed.order.dados.usuario.nome).toEqual('John Doe')
      expect(cartTransformed.order.dados.usuario.sobrenome).toEqual('')
      expect(cartTransformed.order.dados.usuario.cpf).toEqual('')
      expect(cartTransformed.order.dados.usuario.email).toEqual('john@doe.com')
      expect(cartTransformed.order.dados.usuario.telefone).toEqual('5511990283745')
      expect(cartTransformed.order.dados.usuario.telefone_codigo_pais).toEqual('55')
      expect(cartTransformed.order.dados.usuario.data_nascimento).toEqual('')
      expect(cartTransformed.order.dados.usuario.genero).toEqual('')
    })
  })
})
