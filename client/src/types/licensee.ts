export interface ILicensee {
  id: string
  name: string
  email: string
  phone: string
  active: boolean
  apiToken: string
  licenseKind: string
  document: string
  kind: string
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
  useSenderName: boolean
  useFileIDYcloud: boolean
  useSectors: boolean
}
