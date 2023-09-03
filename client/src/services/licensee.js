import { getToken } from './auth'
import api from './api'
import parseUrl from './objectToQueryParameter'

const token = getToken()
const headers = { 'x-access-token': `${token}` }

function createLicensee(values) {
  return api().post('resources/licensees/', { body: values, headers })
}

function getLicensees(queryParams) {
  const url = parseUrl('resources/licensees/', queryParams)
  return api().get(url, { headers })
}

function getLicensee(id) {
  return api().get(`resources/licensees/${id}`, { headers })
}

function updateLicensee(licensee) {
  return api().post(`resources/licensees/${licensee.id}`, { headers, body: licensee })
}

function setLicenseeWebhook(licensee) {
  return api().post(`resources/licensees/${licensee.id}/dialogwebhook`, { headers, body: licensee })
}

function sendLicenseePagarMe(licensee) {
  return api().post(`resources/licensees/${licensee.id}/integration/pagarme`, { headers, body: licensee })
}

function importLicenseeTemplate(licensee) {
  return api().post(`resources/templates/${licensee.id}/importation/`, { headers })
}

export { createLicensee, getLicensees, getLicensee, updateLicensee, setLicenseeWebhook, importLicenseeTemplate, sendLicenseePagarMe }
