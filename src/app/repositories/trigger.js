const Trigger = require('@models/Trigger')

async function createTrigger(fields) {
  const trigger = new Trigger({
    ...fields,
  })

  return await trigger.save()
}

async function getAllTriggerBy(filters, order = {}) {
  if (order) {
    return await Trigger.find(filters).sort(order)
  } else {
    return await Trigger.find(filters)
  }
}

module.exports = { createTrigger, getAllTriggerBy }
