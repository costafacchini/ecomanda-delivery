import { getToken } from './auth'
import api from './api'
import parseUrl from './objectToQueryParameter'
import type { IMessageFilters } from '../types/message'

function getMessages(queryParams: IMessageFilters) {
  const url = parseUrl('resources/messages/', queryParams)
  return api().get(url, { headers: { 'x-access-token': getToken() } })
}

function resendMessage(id: string) {
  return api().post(`resources/messages/${id}/resend`, { headers: { 'x-access-token': getToken() } })
}

export { getMessages, resendMessage }
