export interface ILicensee {
  id: string
  _id: string
  name: string
  email: string
  phone: string
  active: boolean
  apiToken: string
  licenseKind: string
  useChatbot: boolean
  chatbotDefault: string
  chatbotUrl: string
  chatbotAuthorizationToken: string
  messageOnResetChatbot: string
  chatbotApiToken: string
  whatsappDefault: string
  whatsappToken: string
  whatsappUrl: string
  chatDefault: string
  chatUrl: string
  chatKey: string
  chatIdentifier: string
  messageOnCloseChat: string
  document: string
  kind: string
  useSenderName: boolean
  useFileIDYcloud: boolean
  useSectors: boolean
}

export interface ILicenseeFilters {
  page?: number
  expression?: string
  pedidos10_active?: boolean
  active?: boolean
  [key: string]: unknown
}

export type ILicenseeInput = Omit<ILicensee, 'id' | '_id'>
