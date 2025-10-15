class Parser {
  parseOrderPaidEvent(body) {
    const event = {
      id: '',
      status: '',
      payment_status: '',
      charge_id: '',
    }

    if (!body.data || !body.data.charges) return event

    event.id = body.data.id
    event.status = body.data.status
    event.payment_status = body.data.charges[0].status
    event.charge_id = body.data.charges[0].id

    return event
  }
}

export { Parser }
