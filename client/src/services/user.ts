import { getToken } from './auth'
import api from './api'
import parseUrl from './objectToQueryParameter'

const headers = () => ({ 'x-access-token': getToken() })

function createUser(values: any) {
  return api().post('resources/users/', { body: values, headers: headers() })
}

function getUsers(queryParams: any) {
  const url = parseUrl('resources/users/', queryParams)
  return api().get(url, { headers: headers() })
}

function getUser(id: any) {
  return api().get(`resources/users/${id}`, { headers: headers() })
}

function updateUser(user: any) {
  return api().post(`resources/users/${user.id}`, { headers: headers(), body: user })
}

export { createUser, getUsers, getUser, updateUser }
