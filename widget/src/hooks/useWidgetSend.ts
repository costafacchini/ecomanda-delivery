import { useState } from 'react'
import * as api from '../api'
import type { WidgetSession } from '../types'

export function useWidgetSend(baseUrl: string, apiToken: string, session: WidgetSession | null, onSent: () => void) {
  const [sending, setSending] = useState(false)

  async function send(text: string) {
    if (!session) return
    setSending(true)
    try {
      await api.sendMessage(baseUrl, apiToken, session.widgetSessionToken, text)
      onSent()
    } finally {
      setSending(false)
    }
  }

  return { send, sending }
}
