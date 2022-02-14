import { getToken } from './auth'
import api from './api'
import parseUrl from './objectToQueryParameter'

const token = getToken()
const headers = { 'x-access-token': `${token}` }

function createTrigger(values) {
  return api().post('resources/triggers/', { body: values, headers })
}

function getTriggers(queryParams) {
  const url = parseUrl('resources/triggers/', queryParams)
  return api().get(url, { headers })
}

function getTrigger(id) {
  return api().get(`resources/triggers/${id}`, { headers })
}

function updateTrigger(trigger) {
  return api().post(`resources/triggers/${trigger.id}`, { headers, body: trigger })
}

function importTriggerMultiProduct(triggerId, values) {
  return api().post(`resources/triggers/${triggerId}/importation/`, { headers, body: values })
}

export { createTrigger, getTriggers, getTrigger, updateTrigger, importTriggerMultiProduct }
