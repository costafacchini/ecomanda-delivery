export interface IInbox {
  _id: string
  id: string
  name: string
  licensee: string
  kind: 'messenger' | 'chat'
  whatsappDefault?: string
  whatsappToken?: string
  whatsappUrl?: string
  chatDefault?: string
  chatUrl?: string
  chatKey?: string
  chatIdentifier?: string
  inboxToken: string
  webhookUrl: string | null
  active: boolean
}
