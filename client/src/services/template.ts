import { getToken } from './auth'
import api from './api'
import parseUrl from './objectToQueryParameter'

const headers = () => ({ 'x-access-token': getToken() })

function createTemplate(values: any) {
  return api().post('resources/templates/', { body: values, headers: headers() })
}

function getTemplates(queryParams: any) {
  const url = parseUrl('resources/templates/', queryParams)
  return api().get(url, { headers: headers() })
}

function getTemplate(id: any) {
  return api().get(`resources/templates/${id}`, { headers: headers() })
}

function updateTemplate(trigger: any) {
  return api().post(`resources/templates/${trigger.id}`, { headers: headers(), body: trigger })
}

function importTemplates(triggerId: any, values: any) {
  return api().post(`resources/templates/${triggerId}/importation/`, { headers: headers(), body: values })
}

export { createTemplate, getTemplates, getTemplate, updateTemplate, importTemplates }
