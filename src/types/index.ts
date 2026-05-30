import { Types } from 'mongoose'

// --- Enums ---

export enum LicenseKind {
  Demo = 'demo',
  Free = 'free',
  Paid = 'paid',
}

export enum ChatbotDefault {
  Landbot = 'landbot',
  None = '',
}

export enum WhatsappDefault {
  Utalk = 'utalk',
  Dialog = 'dialog',
  Ycloud = 'ycloud',
  Pabbly = 'pabbly',
  Baileys = 'baileys',
  None = '',
}

export enum ChatDefault {
  Rocketchat = 'rocketchat',
  Crisp = 'crisp',
  Cuboup = 'cuboup',
  Chatwoot = 'chatwoot',
  None = '',
}

export enum CartDefault {
  Alloy = 'alloy',
  Go2go = 'go2go',
  Go2goV2 = 'go2go_v2',
  None = '',
}

export enum MessageKind {
  Text = 'text',
  File = 'file',
  Location = 'location',
  Interactive = 'interactive',
  Cart = 'cart',
  Template = 'template',
}

export enum MessageDestination {
  ToChatbot = 'to-chatbot',
  ToChat = 'to-chat',
  ToMessenger = 'to-messenger',
  ToTransfer = 'to-transfer',
}

export enum TriggerKind {
  MultiProduct = 'multi_product',
  SingleProduct = 'single_product',
  ReplyButton = 'reply_button',
  ListMessage = 'list_message',
  Text = 'text',
}

// --- Interfaces ---

export interface ILicensee {
  _id: Types.ObjectId
  name: string
  email?: string
  phone?: string
  active: boolean
  apiToken: string
  licenseKind: LicenseKind
  useChatbot: boolean
  chatbotDefault?: ChatbotDefault
  chatbotUrl?: string
  chatbotApiToken?: string
  messageOnResetChatbot?: string
  messageOnCloseChat?: string
  chatbotAuthorizationToken?: string
  whatsappDefault?: WhatsappDefault
  whatsappToken?: string
  whatsappUrl?: string
  chatDefault?: ChatDefault
  chatUrl?: string
  chatKey?: string
  chatIdentifier?: string
  cartDefault?: CartDefault
  useCartGallabox: boolean
  unidadeId?: string
  statusId?: string
  useWhatsappWindow: boolean
  document?: string
  useSenderName: boolean
  useFileIDYcloud: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IContact {
  _id: Types.ObjectId
  name?: string
  number: string
  type?: string
  talkingWithChatBot: boolean
  email?: string
  licensee: Types.ObjectId | ILicensee
  waId?: string
  isGroup: boolean
  active: boolean
  landbotId?: string
  chatwootId?: string
  chatwootSourceId?: string
  address?: string
  document?: string
  customer_id?: string
  createdAt: Date
  updatedAt: Date
}

export interface IMessage {
  _id: Types.ObjectId
  number: string
  fromMe: boolean
  text?: string
  url?: string
  fileName?: string
  kind: MessageKind
  destination: MessageDestination
  latitude?: number
  longitude?: number
  departament?: string
  senderName?: string
  sended: boolean
  licensee: Types.ObjectId | ILicensee
  contact: Types.ObjectId | IContact
  room?: Types.ObjectId | IRoom
  messageWaId?: string
  attachmentWaId?: string
  sendedAt?: Date
  readAt?: Date
  deliveredAt?: Date
  error?: string
  payload?: string
  replyMessageId?: string
  createdAt: Date
  updatedAt: Date
}

export interface IRoom {
  _id: Types.ObjectId
  roomId?: string
  token?: string
  closed: boolean
  closedAt?: Date
  contact: Types.ObjectId | IContact
  createdAt: Date
  updatedAt: Date
}

export interface ITrigger {
  _id: Types.ObjectId
  name?: string
  triggerKind: TriggerKind
  expression: string
  catalogId?: string
  catalogMulti?: string
  catalogSingle?: string
  textReplyButton?: string
  messagesList?: string
  text?: string
  licensee: Types.ObjectId | ILicensee
  order: number
  createdAt: Date
  updatedAt: Date
}
