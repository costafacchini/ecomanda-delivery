import api from './api'

const TOKEN_KEY = "@ecomanda-delivery-bearer"
const EMAIL_KEY = "@ecomanda-delivery-mail"

export function isAuthenticated() {
  return localStorage.getItem(TOKEN_KEY) !== null
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getEmail() {
  return localStorage.getItem(EMAIL_KEY)
}

export function login(email, token) {
  localStorage.setItem(EMAIL_KEY, email)
  return localStorage.setItem(TOKEN_KEY, token)
}

export function logout() {
  localStorage.removeItem(EMAIL_KEY)
  return localStorage.removeItem(TOKEN_KEY)
}

export async function fetchLoggedUser() {
  const email = getEmail()
  const token = getToken()
  if (token) {
    const headers = { 'x-access-token': `${token}` }
    const response = await api().get(`/resources/users/${email}`, { headers })
    return response.data
  }
  return null
}
