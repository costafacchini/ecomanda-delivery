import { useState, useEffect, useRef } from 'react'
import * as api from '../api'
import type { WidgetMessage, WidgetSession } from '../types'

const POLL_INTERVAL_MS = 5000

export function useWidgetMessages(baseUrl: string, apiToken: string, session: WidgetSession | null) {
  const [messages, setMessages] = useState<WidgetMessage[]>([])
  const lastSeenAt = useRef<string | undefined>(undefined)
  const pollRef = useRef<(() => void) | null>(null)

  async function poll() {
    if (!session) return
    try {
      const { messages: incoming } = await api.fetchMessages(
        baseUrl, apiToken, session.widgetSessionToken, lastSeenAt.current
      )
      if (incoming.length > 0) {
        lastSeenAt.current = incoming[incoming.length - 1].createdAt
        setMessages(prev => {
          const ids = new Set(prev.map((m: WidgetMessage) => m._id))
          const newOnes = incoming.filter((m: any) => !ids.has(m._id))
          return [...prev, ...newOnes]
        })
      }
    } catch {
      // polling errors are non-fatal
    }
  }

  pollRef.current = poll

  useEffect(() => {
    if (!session) return
    poll()
    const id = setInterval(() => pollRef.current?.(), POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [session?.widgetSessionToken]) // eslint-disable-line react-hooks/exhaustive-deps

  return { messages, triggerPoll: () => pollRef.current?.() }
}
