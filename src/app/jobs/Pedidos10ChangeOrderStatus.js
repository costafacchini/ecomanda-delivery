import changeOrderStatus from '../services/Pedidos10ChangeOrderStatus'

export default {
  key: 'pedidos10-change-order-status',
  async handle(data) {
    return await changeOrderStatus(data.body)
  },
}
