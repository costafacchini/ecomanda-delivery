export interface IMessageContact {
  name: string
  number?: string
}

export interface IMessageSector {
  name: string
}

export interface IMessageTrigger {
  _id: string
  name: string
}

export interface IMessage {
  id: string
  _id: string
  kind: string
  text?: string
  url?: string
  fileName?: string
  error?: string
  latitude?: number
  longitude?: number
  cart?: unknown
  createdAt: string
  contact?: IMessageContact
  sector?: IMessageSector
  trigger?: IMessageTrigger
  destination?: string
}

export interface IMessageFilters {
  page?: number
  licensee?: string
  contact?: string
  kind?: string
  destination?: string
  onlyErrors?: boolean
  startDate?: string
  endDate?: string
  [key: string]: unknown
}
