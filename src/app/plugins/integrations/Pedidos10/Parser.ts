class Parser {
  parseOrder(body) {
    const order = {
      merchant_external_code: '',
      order_external_id: '',
      type: '',
      display_id: '',
      status: '',
      customer_information: {
        id: '',
        name: '',
        phone: '',
        document: '',
      },
      total_items: 0,
      total_fees: 0,
      total_discount: 0,
      total_addition: 0,
      total: 0,
      payments: {
        pending: 0,
        prepaid: 0,
        methods: [],
      },
      takeout: {
        mode: '',
        takeout_minutes: 0,
      },
      items: [],
    }

    order.merchant_external_code = body.MerchantExternalCode || ''

    if (body.order) {
      order.order_external_id = body.order.id
      order.type = body.order.type
      order.display_id = body.order.displayId
      order.status = body.order.status
      order.customer_information.id = body.order.customer.id
      order.customer_information.name = body.order.customer.name
      order.customer_information.phone = body.order.customer.phone.number
      order.customer_information.document = body.order.customer.documentNumber
      order.total_items = body.order.total.itemsPrice.value
      order.total_fees = body.order.total.otherFees.value
      order.total_discount = body.order.total.discount.value
      order.total_addition = body.order.total.addition.value
      order.total = body.order.total.orderAmount.value
      order.payments.pending = body.order.payments.pending
      order.payments.prepaid = body.order.payments.prepaid
      order.takeout.mode = body.order.takeout.mode
      order.takeout.takeout_minutes = body.order.takeout.takeoutMinutes

      body.order.payments.methods.forEach((method) => {
        order.payments.methods.push({ value: method.value, type: method.type, method: method.method })
      })

      body.order.items.forEach((item) => {
        const option_groups = []
        if (item.optionGroups) {
          item.optionGroups.forEach((optionGroups) => {
            const options = []
            if (optionGroups.options) {
              optionGroups.options.forEach((option) => {
                options.push({
                  id: option.id,
                  option_id: option.optionGroupOptionId,
                  name: option.name,
                  unit: option.unit,
                  quantity: option.quantity,
                  total: option.totalPrice.value,
                })
              })
            }

            option_groups.push({
              id: optionGroups.id,
              group_id: optionGroups.optionGroupId,
              name: optionGroups.name,
              define_value: optionGroups.defineValue,
              options,
            })
          })
        }

        order.items.push({
          id: item.id,
          product_id: item.productId,
          name: item.name,
          unit: item.unit,
          description: item.completeDescription,
          quantity: item.quantity,
          unit_price: item.unitPrice.value,
          total_price: item.totalPrice.value,
          option_groups,
        })
      })
    }

    return order
  }
}

export { Parser }
