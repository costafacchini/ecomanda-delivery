import { getToken } from '../auth'
import api from '../api'

const token = getToken()
const headers = { 'x-access-token': `${token}` }

function createLicensee(values) {
  return api().post('resources/licensees/', { body: values, headers })
}

function getLicensees() {
  return api().get('resources/licensees/', { headers })
}

function getLicensee(id) {
  return api().get(`resources/licensees/${id}`, { headers })
}

function updateLicensee(licensee) {
  return api().post(`resources/licensees/${licensee.id}`, { headers, body: licensee })
}

export { createLicensee, getLicensees, getLicensee, updateLicensee }
