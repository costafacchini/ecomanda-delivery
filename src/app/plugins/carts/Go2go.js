import { CartRepositoryDatabase } from '../../repositories/cart.js'

class Go2go {
  async transformCart(licensee, cartId) {
    const cartRepository = new CartRepositoryDatabase()
    const cart = await cartRepository.findFirst({ _id: cartId }, ['contact'])

    const cartTransformed = {
      order: {
        unidadeId: licensee.unidadeId,
        origemId: 0,
        deliveryMode: 'MERCHANT',
        refPedido: 'Ecommerce',
        refOrigem: 'Ecommerce',
        refCurtaOrigem: '',
        docNotaFiscal: false,
        valorDocNotaFiscal: '',
        clienteId: cart.contact.plugin_cart_id,
        nomeCliente: cart.contact.name,
        statusId: licensee.statusId,
        endEntrega: '',
        dataPedido: new Date().toISOString(),
        email: cart.contact.email,
        subTotal: cart.total - cart.delivery_tax,
        impostos: 0,
        voucher: 0,
        dataEntrega: new Date().toISOString(),
        taxaEntrega: cart.delivery_tax,
        totalPedido: cart.total,
        observacoesGerais: cart.note,
        documento: '',
        flagIntegrado: 'NaoIntegrado',
        valorPagar: cart.total,
        telefonePedido: cart.contact.number,
        pagamentos: [
          {
            tipo: '',
            valor: cart.total,
            observacao: '',
            codigoResposta: '',
            bandeira: 0,
            troco: 0,
            nsu: 0,
            status: 'NaoInformado',
            descontoId: 0,
            prePago: false,
            transactionId: 0,
          },
        ],
        entrega: {
          retiraLoja: false,
          data: '',
          retirada: 'Hoje',
          endereco: {
            id: 37025,
            pais: 'Brasil',
            uf: cart.contact.uf,
            cidade: cart.contact.city,
            bairro: cart.contact.neighborhood,
            logradouro: cart.contact.address,
            numero: cart.contact.address_number,
            complemento: cart.contact.address_complement,
            cep: cart.contact.cep,
            padrao: false,
          },
        },
      },
    }

    cartTransformed.order.itens = cart.products.map((product) => {
      const adicionalPedidoItems = product.additionals.map((additional) => {
        return {
          produtoId: additional.name,
          atributoValorId: additional.details[0].name,
          quantidade: additional.quantity,
          precoTotal: additional.unit_price,
        }
      })

      return {
        produtoId: product.product_retailer_id,
        quantidade: product.quantity,
        precoTotal: cart.calculateTotalItem(product) / product.quantity,
        adicionalPedidoItems,
      }
    })

    return cartTransformed
  }
}

export { Go2go }
