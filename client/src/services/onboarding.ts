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
  userName: string
  userEmail: string
  password: string
}

export function createAccount(fields: OnboardingFields) {
  return api().post('/login/onboarding', { body: fields })
}
