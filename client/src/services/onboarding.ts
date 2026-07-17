import api from './api'

export interface OnboardingFields {
  licenseeName: string
  kind: string
  document: string
  licenseeEmail: string
  phone: string
  chatDefault?: string
  chatUrl?: string
  chatIdentifier?: string
  chatKey?: string
  whatsappDefault?: string
  whatsappToken?: string
  whatsappUrl?: string
  useDepartments?: boolean
  userName: string
  userEmail: string
  password: string
  language?: 'pt' | 'en'
}

export function createAccount(fields: OnboardingFields) {
  return api().post('/login/onboarding', { body: fields })
}
