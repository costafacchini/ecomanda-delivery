import { CartRepositoryDatabase  } from '@repositories/cart.js'

class Go2goV2 {
  getPaymentType(payment_method) {
    if (!payment_method || payment_method === '') return 'Outros'

    if ('dinheiro'.includes(payment_method.toLowerCase())) return 'Dinheiro'
    if ('débito,debito'.includes(payment_method.toLowerCase())) return 'Debito'
    if ('crédito,credito,visa,master,mastercard,elo'.includes(payment_method.toLowerCase())) return 'Credito'
    if ('refeicao,refeição,refeicão,ticket,alimentacao'.includes(payment_method.toLowerCase())) return 'Refeicao'
    if ('fidelidade'.includes(payment_method.toLowerCase())) return 'Fidelidade'

    return 'Outros'
  }

  async transformCart(licensee, cartId) {
    const cartRepository = new CartRepositoryDatabase()
    const cart = await cartRepository.findFirst({ _id: cartId }, ['contact'])

    const cartTransformed = {
      order: {
        unidadeId: licensee.unidadeId,
        origemId: 74,
        deliveryMode: 'MERCHANT',
        refPedido: 'Ecommerce',
        refOrigem: 'Ecommerce',
        refCurtaOrigem: 'Ecommerce',
        jsonPedido: '',
        docNotaFiscal: false,
        nomeCliente: cart.contact.name,
        valorDocNotaFiscal: '',
        clienteId: cart.contact.plugin_cart_id,
        statusId: licensee.statusId,
        endEntrega: '',
        telefonePedido: cart.contact.number,
        email: cart.contact.email,
        dataPedido: new Date().toISOString(),
        dataEntrega: new Date().toISOString(),
        subTotal: cart.total - cart.delivery_tax,
        impostos: 0,
        voucher: 0,
        taxaEntrega: cart.delivery_tax,
        totalPedido: cart.total,
        observacoesGerais: cart.note,
        documento: '',
        flagIntegrado: 'NaoIntegrado',
        valorPagar: cart.total,
        pagamentos: [
          {
            tipo: 0,
            tipopagamentoid: this.getPaymentType(cart.payment_method),
            valor: cart.total,
            observacao: '',
            transactionId: '',
            codigoResposta: '',
            nsu: 0,
            status: 'NaoInformado',
            troco: 0,
            bandeira: 0,
            descontoId: 0,
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
          pedidoItemId: 0,
          atributoValorId: 0,
          produtoId: additional.name,
          nomeAtributoValor: additional.details[0].name,
          quantidade: additional.quantity,
          precoTotal: additional.unit_price,
        }
      })

      return {
        pedidoId: 0,
        produtoId: 0,
        produto: {
          id: 0,
          externalCode: product.product_retailer_id,
          sku: product.product_retailer_id,
        },
        quantidade: product.quantity,
        precoTotal: cart.calculateTotalItem(product) / product.quantity,
        adicionalPedidoItems,
      }
    })

    return cartTransformed
  }
}

export default Go2goV2
