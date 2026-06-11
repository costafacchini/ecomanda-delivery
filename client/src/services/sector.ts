import { getToken } from './auth'
import api from './api'
import parseUrl from './objectToQueryParameter'

const headers = () => ({ 'x-access-token': getToken() })

function getSectors(queryParams: any) {
  const url = parseUrl('resources/sectors/', queryParams)
  return api().get(url, { headers: headers() })
}

function getSector(id: any) {
  return api().get(`resources/sectors/${id}`, { headers: headers() })
}

function createSector(values: any) {
  return api().post('resources/sectors/', { body: values, headers: headers() })
}

function updateSector(sector: any) {
  return api().post(`resources/sectors/${sector.id}`, { headers: headers(), body: sector })
}

function deleteSector(id: any) {
  return api().delete(`resources/sectors/${id}`, { headers: headers() })
}

function getSectorBaileysStatus(sector: any) {
  return api().get(`resources/sectors/${sector.id}/baileys-status`, { headers: headers() })
}

function getSectorBaileysQr(sector: any) {
  return api().post(`resources/sectors/${sector.id}/baileys-qr`, { headers: headers() })
}

function syncSectorBaileys(sector: any) {
  return api().post(`resources/sectors/${sector.id}/baileys-sync`, { headers: headers() })
}

export {
  getSectors,
  getSector,
  createSector,
  updateSector,
  deleteSector,
  getSectorBaileysStatus,
  getSectorBaileysQr,
  syncSectorBaileys,
}
