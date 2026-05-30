import { getToken } from './auth'
import api from './api'
import parseUrl from './objectToQueryParameter'

const headers = () => ({ 'x-access-token': getToken() })

function createContact(values: any) {
  return api().post('resources/contacts/', { body: values, headers: headers() })
}

function getContacts(queryParams: any) {
  const url = parseUrl('resources/contacts/', queryParams)
  return api().get(url, { headers: headers() })
}

function getContact(id: any) {
  return api().get(`resources/contacts/${id}`, { headers: headers() })
}

function updateContact(contact: any) {
  return api().post(`resources/contacts/${contact.id}`, { headers: headers(), body: contact })
}

export { createContact, getContacts, getContact, updateContact }
