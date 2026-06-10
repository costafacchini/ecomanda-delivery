import { getToken } from './auth'
import api from './api'
import parseUrl from './objectToQueryParameter'

const headers = () => ({ 'x-access-token': getToken() })

function getSetores(queryParams: any) {
  const url = parseUrl('resources/setores/', queryParams)
  return api().get(url, { headers: headers() })
}

function getSetor(id: any) {
  return api().get(`resources/setores/${id}`, { headers: headers() })
}

function createSetor(values: any) {
  return api().post('resources/setores/', { body: values, headers: headers() })
}

function updateSetor(setor: any) {
  return api().post(`resources/setores/${setor.id}`, { headers: headers(), body: setor })
}

function deleteSetor(id: any) {
  return api().delete(`resources/setores/${id}`, { headers: headers() })
}

function getSetorBaileysStatus(setor: any) {
  return api().get(`resources/setores/${setor.id}/baileys-status`, { headers: headers() })
}

function getSetorBaileysQr(setor: any) {
  return api().post(`resources/setores/${setor.id}/baileys-qr`, { headers: headers() })
}

function syncSetorBaileys(setor: any) {
  return api().post(`resources/setores/${setor.id}/baileys-sync`, { headers: headers() })
}

export {
  getSetores,
  getSetor,
  createSetor,
  updateSetor,
  deleteSetor,
  getSetorBaileysStatus,
  getSetorBaileysQr,
  syncSetorBaileys,
}
