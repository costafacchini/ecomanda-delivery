class OrdersController {
  receivePedidos10Order: any
  changePedidos10OrderStatus: any

  constructor({ receivePedidos10Order, changePedidos10OrderStatus }: Record<string, any> = {}) {
    this.receivePedidos10Order = receivePedidos10Order
    this.changePedidos10OrderStatus = changePedidos10OrderStatus

    this.create = this.create.bind(this)
    this.changeStatus = this.changeStatus.bind(this)
  }

  async create(req: any, res: any) {
    const { MerchantExternalCode, order } = req.body

    const bodySaved = await this.receivePedidos10Order.execute({
      licenseeId: req.licensee._id,
      MerchantExternalCode,
      order,
    })

    res.status(202).send({ id: bodySaved._id })
  }

  async changeStatus(req: any, res: any) {
    const { order, status } = req.body

    const bodySaved = await this.changePedidos10OrderStatus.execute({
      licenseeId: req.licensee._id,
      order,
      status,
    })

    res.status(200).send({ id: bodySaved._id })
  }
}

export { OrdersController }
