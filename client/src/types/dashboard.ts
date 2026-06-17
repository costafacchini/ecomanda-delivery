/** Returned by getDashboardLicensees */
export interface IDashboardLicensees {
  total: number
  active: number
  by_kind: {
    demo: number
    free: number
    paid: number
  }
}

/** Returned by getDashboardContacts */
export interface IDashboardContacts {
  total: number
  in_chatbot: number
}

/** Returned by getDashboardMessageVolume */
export interface IDashboardMessageVolumeRow {
  _id: string
  count: number
}

export interface IDashboardMessageVolume {
  total: number
  per_hour?: IDashboardMessageVolumeRow[]
  per_day?: IDashboardMessageVolumeRow[]
}

/** Returned by getDashboardDeliveryRate */
export interface IDashboardDeliveryRate {
  total: number
  sent: number
  failed: number
  rate: number
  failed_today?: number
}

/** Returned by getDashboardQueue */
export interface IDashboardQueue {
  pending_messages: number
}

/** Returned by getDashboardConversations */
export interface IDashboardConversations {
  total: number
  avg_duration?: number
}

/** Returned by getDashboardMessagesToday */
export interface IDashboardMessagesToday {
  sent_today: number
  failed_today: number
  sent_pct: number
  failed_pct: number
}

/** Returned by getDashboardMessagesPerDay */
export interface IDashboardMessagesPerDayRow {
  date: string
  count: number
}

export interface IDashboardMessagesPerDay {
  per_day: IDashboardMessagesPerDayRow[]
}

/** Room shape returned by getDashboardOpenRooms */
export interface IDashboardRoom {
  _id: string
  createdAt?: string
  contact?: {
    name?: string
    number?: string
  }
  lastMessage?: {
    text?: string
    createdAt?: string
  }
}

export interface IDashboardOpenRooms {
  rooms: IDashboardRoom[]
  hasMore: boolean
}

/** Common date-range filter params used by time-scoped dashboard endpoints */
export interface IDashboardDateFilters {
  startDate?: string
  endDate?: string
  licensee?: string
  [key: string]: unknown
}

/** Pagination params for open rooms */
export interface IDashboardOpenRoomsFilters extends IDashboardDateFilters {
  page?: number
  limit?: number
}
