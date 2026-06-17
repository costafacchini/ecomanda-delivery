import { getToken } from './auth'
import api from './api'
import parseUrl from './objectToQueryParameter'
import type { ITrigger, ITriggerFilters, ITriggerInput, ITriggerImportValues } from '../types/trigger'

const headers = () => ({ 'x-access-token': getToken() })

function createTrigger(values: ITriggerInput) {
  return api().post('resources/triggers/', { body: values, headers: headers() })
}

function getTriggers(queryParams: ITriggerFilters) {
  const url = parseUrl('resources/triggers/', queryParams)
  return api().get(url, { headers: headers() })
}

function getTrigger(id: string) {
  return api().get(`resources/triggers/${id}`, { headers: headers() })
}

function updateTrigger(trigger: ITrigger) {
  return api().post(`resources/triggers/${trigger.id}`, { headers: headers(), body: trigger })
}

function importTriggerMultiProduct(triggerId: string, values: ITriggerImportValues) {
  return api().post(`resources/triggers/${triggerId}/importation/`, { headers: headers(), body: values })
}

export { createTrigger, getTriggers, getTrigger, updateTrigger, importTriggerMultiProduct }
