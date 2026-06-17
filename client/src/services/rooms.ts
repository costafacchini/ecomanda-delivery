import api from './api'
import parseUrl from './objectToQueryParameter'
import type { IRoom } from '../types'
import type { IMessage } from '../types'

interface IRoomListResponse { rooms: IRoom[]; hasMore: boolean }
interface IRoomMessagesResponse { messages: IMessage[]; total: number; page: number; hasMore: boolean }

export function getRooms(params: { page?: number; licensee?: string } = {}) {
  const url = parseUrl('resources/rooms', params as Record<string, unknown>)
  return api().get<IRoomListResponse>(url)
}

export function createRoom(contactId: string) {
  return api().post<{ room: IRoom }>('resources/rooms', { body: { contactId } })
}

export function getRoomMessages(roomId: string, params: { page?: number } = {}) {
  const url = parseUrl(`resources/rooms/${roomId}/messages`, params as Record<string, unknown>)
  return api().get<IRoomMessagesResponse>(url)
}

export function sendRoomMessage(roomId: string, text: string) {
  return api().post(`v1/chat/rooms/${roomId}/messages`, { body: { text } })
}
