import { CartRepositoryDatabase  } from '@repositories/cart.js'

class Alloy {
  async transformCart(_, cartId) {
    const cartRepository = new CartRepositoryDatabase()
    const cart = await cartRepository.findFirst({ _id: cartId }, ['contact'])

    const cartTransformed = {
      order: {
        provedor: '',
        id_externo: cart._id,
        dados: {
          pedido: {
            obs: cart.note,
            data_agendamento: '',
            meio_de_entrega: cart.delivery_method,
            cpf_cnpj: cart.documento,
            agendamento: 0,
            numero_de_pessoas: 0,
          },
          pagamento: [
            {
              forma_de_pagamento: Number(cart.payment_method),
              total: cart.total,
              troco_para: 0,
            },
          ],
          valores_entrega: {
            valor_entrega: cart.delivery_tax,
            valor_desconto_entrega: 0,
          },
          endereco_de_entrega: {
            logradouro: cart.contact.address,
            numero: cart.contact.address_number,
            complemento: cart.contact.address_complement,
            referencia: cart.location,
            bairro: cart.contact.neighborhood,
            cep: cart.contact.cep,
            cidade: cart.contact.city,
            uf: cart.contact.uf,
            coordenadas_cliente: `${cart.latitude}, ${cart.longitude}`,
          },
          usuario: {
            nome: cart.contact.name,
            sobrenome: '',
            cpf: '',
            email: cart.contact.email,
            telefone: cart.contact.number,
            telefone_codigo_pais: '55',
            data_nascimento: '',
            genero: '',
          },
        },
      },
    }

    cartTransformed.order.dados.pedido.itens = cart.products.map((product) => {
      const complementos = product.additionals.map((additional) => {
        return {
          quantidade: additional.quantity,
          valor: additional.unit_price,
          id_alloy: additional.product_retailer_id,
          id_externo: additional.product_fb_id,
          nome: additional.name,
          descricao: additional.details[0].name,
        }
      })

      return {
        quantidade: product.quantity,
        obs: product.note,
        valor: cart.calculateTotalItem(product) / product.quantity,
        id_alloy: product.product_retailer_id,
        id_externo: product.product_fb_id,
        nome: product.name,
        descricao: '',
        valor_desconto: 0,
        complementos,
      }
    })

    return cartTransformed
  }
}

export default Alloy
