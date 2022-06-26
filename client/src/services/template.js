import { getToken } from './auth'
import api from './api'
import parseUrl from './objectToQueryParameter'

const token = getToken()
const headers = { 'x-access-token': `${token}` }

function createTemplate(values) {
  return api().post('resources/templates/', { body: values, headers })
}

function getTemplates(queryParams) {
  const url = parseUrl('resources/templates/', queryParams)
  return api().get(url, { headers })
}

function getTemplate(id) {
  return api().get(`resources/templates/${id}`, { headers })
}

function updateTemplate(trigger) {
  return api().post(`resources/templates/${trigger.id}`, { headers, body: trigger })
}

function importTemplates(triggerId, values) {
  return api().post(`resources/templates/${triggerId}/importation/`, { headers, body: values })
}

export { createTemplate, getTemplates, getTemplate, updateTemplate, importTemplates }
