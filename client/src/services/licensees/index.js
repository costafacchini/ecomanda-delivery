import { getToken } from '../auth'
import api from '../api'
import parseUrl from '../objectToQueryParameter'

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

export { createLicensee, getLicensees, getLicensee, updateLicensee, setLicenseeWebhook }
