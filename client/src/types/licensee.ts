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
  // Read-only webhook URLs returned by the API
  urlChatWebhook?: string
  urlChatbotWebhook?: string
  urlChatbotTransfer?: string
  urlWhatsappWebhook?: string
}

/** Form values used by both the edit form and the new-licensee wizard. */
export interface ILicenseeFormValues {
  name: string
  email: string
  phone: string
  active: boolean
  apiToken: string
  licenseKind: string
  useChatbot: boolean
  useFileIDYcloud: boolean
  chatbotDefault: string
  chatbotUrl: string
  chatbotAuthorizationToken: string
  messageOnResetChatbot: string
  chatbotApiToken: string
  whatsappDefault: string
  whatsappToken: string
  whatsappUrl: string
  chatDefault: string
  chatIdentifier: string
  chatKey: string
  chatUrl: string
  messageOnCloseChat: string
  document: string
  kind: string
  useSenderName: boolean
  useSectors: boolean
}
