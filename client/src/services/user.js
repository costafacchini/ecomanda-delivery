import { getToken } from './auth'
import api from './api'
import parseUrl from './objectToQueryParameter'

const token = getToken()
const headers = { 'x-access-token': `${token}` }

function createUser(values) {
  return api().post('resources/users/', { body: values, headers })
}

function getUsers(queryParams) {
  const url = parseUrl('resources/users/', queryParams)
  return api().get(url, { headers })
}

function getUser(id) {
  return api().get(`resources/users/${id}`, { headers })
}

function updateUser(user) {
  return api().post(`resources/users/${user.id}`, { headers, body: user })
}

export { createUser, getUsers, getUser, updateUser }
