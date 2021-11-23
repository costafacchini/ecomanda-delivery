import { getToken } from '../../../../services/auth'
import api from '../../../../services/api'
import parseUrl from '../objectToQueryParameter'

const token = getToken()
const headers = { 'x-access-token': `${token}` }

function createContact(values) {
  return api().post('resources/contacts/', { body: values, headers })
}

function getContacts(queryParams) {
  const url = parseUrl('resources/contacts/', queryParams)
  return api().get(url, { headers })
}

function getContact(id) {
  return api().get(`resources/contacts/${id}`, { headers })
}

function updateContact(contact) {
  return api().post(`resources/contacts/${contact.id}`, { headers, body: contact })
}

export { createContact, getContacts, getContact, updateContact }
