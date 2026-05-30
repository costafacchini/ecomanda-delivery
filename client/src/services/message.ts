import { getToken } from './auth'
import api from './api'
import parseUrl from './objectToQueryParameter'

function getMessages(queryParams: any) {
  const url = parseUrl('resources/messages/', queryParams)
  return api().get(url, { headers: { 'x-access-token': getToken() } })
}

function resendMessage(id: any) {
  return api().post(`resources/messages/${id}/resend`, { headers: { 'x-access-token': getToken() } })
}

export { getMessages, resendMessage }
