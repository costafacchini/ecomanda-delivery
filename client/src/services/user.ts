import { getToken } from './auth'
import api from './api'
import parseUrl from './objectToQueryParameter'
import type { IUser, IUserFilters, IUserInput } from '../types/user'

const headers = () => ({ 'x-access-token': getToken() })

function createUser(values: IUserInput) {
  return api().post('resources/users/', { body: values, headers: headers() })
}

function getUsers(queryParams: IUserFilters) {
  const url = parseUrl('resources/users/', queryParams)
  return api().get(url, { headers: headers() })
}

function getUser(id: string) {
  return api().get(`resources/users/${id}`, { headers: headers() })
}

function updateUser(user: IUser) {
  return api().post(`resources/users/${user.id}`, { headers: headers(), body: user })
}

export { createUser, getUsers, getUser, updateUser }
