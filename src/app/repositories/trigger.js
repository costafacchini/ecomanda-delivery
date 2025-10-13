import Trigger from '../models/Trigger.js'
import _ from 'lodash'

async function createTrigger(fields) {
  const trigger = new Trigger({
    ...fields,
  })

  return await trigger.save()
}

async function getAllTriggerBy(filters, order = {}) {
  if (_.isEmpty(order)) {
    return await Trigger.find(filters)
  } else {
    return await Trigger.find(filters).sort(order)
  }
}

export { createTrigger, getAllTriggerBy }
