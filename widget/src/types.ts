export type Language = 'pt' | 'en'

export interface WidgetMessage {
  _id: string
  text: string
  senderName?: string | null
  destination: 'to-chat' | 'to-messenger'
  createdAt: string
}

export interface WidgetSession {
  widgetSessionToken: string
  contactId: string
  licenseeId: string
}
