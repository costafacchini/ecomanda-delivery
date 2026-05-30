import { getToken } from './auth'
import api from './api'
import parseUrl from './objectToQueryParameter'

const headers = () => ({ 'x-access-token': getToken() })

function createTrigger(values: any) {
  return api().post('resources/triggers/', { body: values, headers: headers() })
}

function getTriggers(queryParams: any) {
  const url = parseUrl('resources/triggers/', queryParams)
  return api().get(url, { headers: headers() })
}

function getTrigger(id: any) {
  return api().get(`resources/triggers/${id}`, { headers: headers() })
}

function updateTrigger(trigger: any) {
  return api().post(`resources/triggers/${trigger.id}`, { headers: headers(), body: trigger })
}

function importTriggerMultiProduct(triggerId: any, values: any) {
  return api().post(`resources/triggers/${triggerId}/importation/`, { headers: headers(), body: values })
}

export { createTrigger, getTriggers, getTrigger, updateTrigger, importTriggerMultiProduct }
