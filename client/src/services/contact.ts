import { getToken } from './auth'
import api from './api'
import parseUrl from './objectToQueryParameter'
import type { IContact, IContactFilters, IContactInput } from '../types/contact'

const headers = () => ({ 'x-access-token': getToken() })

function createContact(values: IContactInput) {
  return api().post('resources/contacts/', { body: values, headers: headers() })
}

function getContacts(queryParams: IContactFilters) {
  const url = parseUrl('resources/contacts/', queryParams)
  return api().get(url, { headers: headers() })
}

function getContact(id: string) {
  return api().get(`resources/contacts/${id}`, { headers: headers() })
}

function updateContact(contact: IContact) {
  return api().post(`resources/contacts/${contact.id}`, { headers: headers(), body: contact })
}

export { createContact, getContacts, getContact, updateContact }
