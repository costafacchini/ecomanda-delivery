import { getToken } from './auth'
import api from './api'
import parseUrl from './objectToQueryParameter'

const headers = () => ({ 'x-access-token': getToken() })

// Point-in-time — no date params
export function getDashboardLicensees() {
  return api().get('resources/dashboard/licensees', { headers: headers() })
}
export function getDashboardContacts() {
  return api().get('resources/dashboard/contacts', { headers: headers() })
}

// Time-scoped — accept optional { startDate, endDate }
export function getDashboardMessageVolume(params = {}) {
  return api().get(parseUrl('resources/dashboard/message-volume', params), { headers: headers() })
}
export function getDashboardDeliveryRate(params = {}) {
  return api().get(parseUrl('resources/dashboard/delivery-rate', params), { headers: headers() })
}
export function getDashboardQueue(params = {}) {
  return api().get(parseUrl('resources/dashboard/queue', params), { headers: headers() })
}
export function getDashboardConversations(params = {}) {
  return api().get(parseUrl('resources/dashboard/conversations', params), { headers: headers() })
}
export function getDashboardMessagesToday(params = {}) {
  return api().get(parseUrl('resources/dashboard/messages-today', params), { headers: headers() })
}
export function getDashboardMessagesPerDay(params = {}) {
  return api().get(parseUrl('resources/dashboard/messages-per-day', params), { headers: headers() })
}
export function getDashboardOpenRooms(params = {}) {
  return api().get(parseUrl('resources/dashboard/open-rooms', params), { headers: headers() })
}
export function closeDashboardRoom(roomId: string) {
  return api().post(`resources/dashboard/rooms/${roomId}/close`, {}, { headers: headers() })
}
