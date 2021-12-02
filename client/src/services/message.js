import { getToken } from './auth'
import api from './api'
import parseUrl from './objectToQueryParameter'

const token = getToken()
const headers = { 'x-access-token': `${token}` }

function getMessages(queryParams) {
  const url = parseUrl('resources/messages/', queryParams)
  return api().get(url, { headers })
}

export { getMessages }
