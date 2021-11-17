import { getToken } from '../../../../services/auth'
import api from '../../../../services/api'

const token = getToken()
const headers = { 'x-access-token': `${token}` }

function createContact(values) {
  return api().post('resources/contacts/', { body: values, headers })
}

function getContacts() {
  return api().get('resources/contacts/', { headers })
}

function getContact(id) {
  return api().get(`resources/contact/${id}`, { headers })
}

function updateContact(contact) {
  return api().post(`resources/contacts/${contact.id}`, { headers, body: contact })
}

export { createContact, getContacts, getContact, updateContact }
