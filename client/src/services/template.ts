import { getToken } from './auth'
import api from './api'
import parseUrl from './objectToQueryParameter'
import type { ITemplate, ITemplateFilters, ITemplateInput, ITemplateImportValues } from '../types/template'

const headers = () => ({ 'x-access-token': getToken() })

function createTemplate(values: ITemplateInput) {
  return api().post('resources/templates/', { body: values, headers: headers() })
}

function getTemplates(queryParams: ITemplateFilters) {
  const url = parseUrl('resources/templates/', queryParams)
  return api().get(url, { headers: headers() })
}

function getTemplate(id: string) {
  return api().get(`resources/templates/${id}`, { headers: headers() })
}

function updateTemplate(template: ITemplate) {
  return api().post(`resources/templates/${template.id}`, { headers: headers(), body: template })
}

function importTemplates(triggerId: string, values: ITemplateImportValues) {
  return api().post(`resources/templates/${triggerId}/importation/`, { headers: headers(), body: values })
}

export { createTemplate, getTemplates, getTemplate, updateTemplate, importTemplates }
