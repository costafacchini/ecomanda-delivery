import { getToken } from './auth'
import api from './api'
import parseUrl from './objectToQueryParameter'
import type { ILicensee, ILicenseeFilters, ILicenseeInput } from '../types/licensee'

const headers = () => ({ 'x-access-token': getToken() })

function createLicensee(values: ILicenseeInput) {
  return api().post('resources/licensees/', { body: values, headers: headers() })
}

function getLicensees(queryParams: ILicenseeFilters) {
  const url = parseUrl('resources/licensees/', queryParams)
  return api().get(url, { headers: headers() })
}

function getLicensee(id: string) {
  return api().get(`resources/licensees/${id}`, { headers: headers() })
}

function updateLicensee(licensee: ILicensee) {
  return api().post(`resources/licensees/${licensee.id}`, { headers: headers(), body: licensee })
}

function setLicenseeWebhook(licensee: ILicensee) {
  return api().post(`resources/licensees/${licensee.id}/dialogwebhook`, { headers: headers(), body: licensee })
}

function getBaileysQr(licensee: Pick<ILicensee, 'id'>) {
  return api().post(`resources/licensees/${licensee.id}/baileys-qr`, { headers: headers() })
}

function getBaileysStatus(licensee: Pick<ILicensee, 'id'>) {
  return api().get(`resources/licensees/${licensee.id}/baileys-status`, { headers: headers() })
}

function sendLicenseePagarMe(licensee: ILicensee) {
  return api().post(`resources/licensees/${licensee.id}/integration/pagarme`, { headers: headers(), body: licensee })
}

function importLicenseeTemplate(licensee: ILicensee) {
  return api().post(`resources/templates/${licensee.id}/importation/`, { headers: headers() })
}

function signOrderWebhook(licensee: ILicensee) {
  return api().post(`resources/licensees/${licensee.id}/sign-order-webhook`, { headers: headers(), body: licensee })
}

function syncBaileysDirectory(licensee: ILicensee) {
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
