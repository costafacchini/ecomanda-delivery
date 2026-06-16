import type { IContact } from './contact'

export interface IMessageTriggerRef {
  _id: string
  name: string
}

export interface IMessageSectorRef {
  _id: string
  name: string
}

export interface IMessage {
  id: string
  kind: 'text' | 'file' | 'location' | 'interactive' | 'cart' | string
  destination: 'to-chatbot' | 'to-chat' | 'to-messenger' | 'to-transfer' | string
  text: string
  url: string
  fileName: string
  latitude: number
  longitude: number
  sended: boolean
  error: string | null
  cart: unknown
  createdAt: string
  contact: Pick<IContact, 'id' | 'name'> | null
  trigger: IMessageTriggerRef | null
  sector: IMessageSectorRef | null
}
