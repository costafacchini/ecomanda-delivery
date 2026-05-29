import { getToken } from './auth'
import api from './api'
import parseUrl from './objectToQueryParameter'

const headers = () => ({ 'x-access-token': getToken() })

function createLicensee(values) {
  return api().post('resources/licensees/', { body: values, headers: headers() })
}

function getLicensees(queryParams) {
  const url = parseUrl('resources/licensees/', queryParams)
  return api().get(url, { headers: headers() })
}

function getLicensee(id) {
  return api().get(`resources/licensees/${id}`, { headers: headers() })
}

function updateLicensee(licensee) {
  return api().post(`resources/licensees/${licensee.id}`, { headers: headers(), body: licensee })
}

function setLicenseeWebhook(licensee) {
  return api().post(`resources/licensees/${licensee.id}/dialogwebhook`, { headers: headers(), body: licensee })
}

function getBaileysQr(licensee) {
  return api().post(`resources/licensees/${licensee.id}/baileys-qr`, { headers: headers() })
}

function getBaileysStatus(licensee) {
  return api().get(`resources/licensees/${licensee.id}/baileys-status`, { headers: headers() })
}

function sendLicenseePagarMe(licensee) {
  return api().post(`resources/licensees/${licensee.id}/integration/pagarme`, { headers: headers(), body: licensee })
}

function importLicenseeTemplate(licensee) {
  return api().post(`resources/templates/${licensee.id}/importation/`, { headers: headers() })
}

function signOrderWebhook(licensee) {
  return api().post(`resources/licensees/${licensee.id}/sign-order-webhook`, { headers: headers(), body: licensee })
}

function syncBaileysDirectory(licensee) {
  return api().post(`resources/licensees/${licensee.id}/baileys-sync`, { headers: headers() })
}

export {
  createLicensee,
  getLicensees,
  getLicensee,
  updateLicensee,
  setLicenseeWebhook,
  getBaileysQr,
  getBaileysStatus,
  importLicenseeTemplate,
  sendLicenseePagarMe,
  signOrderWebhook,
  syncBaileysDirectory,
}
