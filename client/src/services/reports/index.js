import { getToken } from '../auth'
import api from '../api'

const token = getToken()
const headers = { 'x-access-token': `${token}` }

function getReports() {
  return api().get('resources/reports', { headers })
}


export { getReports }
