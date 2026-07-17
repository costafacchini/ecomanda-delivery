import type { IMessage } from './message'

export interface IRoom {
  _id: string
  id: string
  contact: {
    _id: string
    name: string
    number?: string
  }
  department?: string | null
  status: 'pending' | 'open' | 'closed'
  closed: boolean
  unreadCount?: number
  lastMessage?: Pick<IMessage, 'text' | 'kind'> & { createdAt?: string } | null
}
