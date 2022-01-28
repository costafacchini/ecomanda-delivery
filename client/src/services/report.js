import { getToken } from './auth'
import api from './api'
import parseUrl from './objectToQueryParameter'

const token = getToken()
const headers = { 'x-access-token': `${token}` }

function getBilling(queryParams) {
  const url = parseUrl('resources/reports/billing/', queryParams)
  return api().get(url, { headers })
}

export { getBilling }
