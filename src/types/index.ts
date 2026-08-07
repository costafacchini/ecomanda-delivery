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

export enum MessageKind {
  Text = 'text',
  File = 'file',
  Location = 'location',
  Interactive = 'interactive',
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
  _id: string
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
  _id: string
  name?: string
  number: string
  type?: string
  talkingWithChatBot: boolean
  email?: string
  licensee: string | ILicensee
  waId?: string
  isGroup: boolean
  active: boolean
  landbotId?: string
  chatwootId?: string
  chatwootSourceId?: string
  document?: string
  customer_id?: string
  createdAt: Date
  updatedAt: Date
}

export interface IMessage {
  _id: string
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
  licensee: string | ILicensee
  contact: string | IContact
  room?: string | IRoom
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
  _id: string
  roomId?: string
  token?: string
  closed: boolean
  closedAt?: Date
  contact: string | IContact
  createdAt: Date
  updatedAt: Date
}

export interface ITrigger {
  _id: string
  name?: string
  triggerKind: TriggerKind
  expression: string
  catalogId?: string
  catalogMulti?: string
  catalogSingle?: string
  textReplyButton?: string
  messagesList?: string
  text?: string
  licensee: string | ILicensee
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface IBody {
  _id: string
  content: Record<string, unknown>
  licensee: string | ILicensee
  kind: 'normal' | 'webhook'
  department?: string
  inbox?: string
  concluded: boolean
  createdAt: Date
  updatedAt: Date
}
