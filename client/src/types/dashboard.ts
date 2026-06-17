export interface IDashboardLicensees {
  total: number
  active: number
  by_kind: {
    demo?: number
    free?: number
    paid?: number
  }
}

export interface IDashboardMessageVolumeRow {
  _id: string
  count: number
}

export interface IDashboardMessageVolume {
  peak_throughput: number
  avg_transfer_rate: number
  per_day: IDashboardMessageVolumeRow[]
  per_hour: IDashboardMessageVolumeRow[]
}

export interface IDashboardDeliveryRate {
  sent_today: number
  sent_pct: number
  failed_today: number
  failed_pct: number
}

export interface IDashboardQueue {
  pending_messages: number
  avg_time_in_queue_seconds: number
}

export interface IDashboardConversations {
  started_today: number
  ended_today: number
  avg_messages_per_conversation: number
  avg_duration_seconds: number
}

export interface IDashboardContacts {
  total: number
  in_chatbot: number
}

export interface IDashboardMessagesToday {
  sent_today: number
  sent_pct: number
  failed_today: number
  failed_pct: number
}

export interface IDashboardMessagesPerDayRow {
  date: string
  count: number
}

export interface IDashboardMessagesPerDay {
  per_day: IDashboardMessagesPerDayRow[]
}

export interface IDashboardOpenRoomContact {
  name?: string
  number?: string
}

export interface IDashboardOpenRoomLastMessage {
  text?: string
  createdAt?: string
}

export interface IDashboardOpenRoom {
  _id: string
  contact?: IDashboardOpenRoomContact
  lastMessage?: IDashboardOpenRoomLastMessage
  createdAt?: string
}

export interface IDashboardOpenRoomsResponse {
  rooms: IDashboardOpenRoom[]
  hasMore: boolean
}

export interface IBaileysStatusResponse {
  connected: boolean
}

export interface IBaileysQrResponse {
  qr?: string
  message?: string
}
