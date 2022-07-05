const Trigger = require('@models/Trigger')
const isEmpty = require('lodash/isEmpty')

async function createTrigger(fields) {
  const trigger = new Trigger({
    ...fields,
  })

  return await trigger.save()
}

async function getAllTriggerBy(filters, order = {}) {
  if (isEmpty(order)) {
    return await Trigger.find(filters)
  } else {
    return await Trigger.find(filters).sort(order)
  }
}

module.exports = { createTrigger, getAllTriggerBy }
