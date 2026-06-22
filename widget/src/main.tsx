import ReactDOM from 'react-dom/client'
import { useState, useEffect } from 'react'
import { App } from './App'
import { useWidgetSession } from './hooks/useWidgetSession'
import { useWidgetMessages } from './hooks/useWidgetMessages'
import { useWidgetSend } from './hooks/useWidgetSend'

const scriptEl = document.currentScript as HTMLScriptElement | null
const baseUrl = scriptEl ? new URL(scriptEl.src).origin : ''
const apiToken = scriptEl?.dataset.licensee ?? ''

type InitData = { name: string; email: string; phone?: string }
interface EcomandaWidgetAPI {
  init: (data: InitData) => void
  _handler: ((data: InitData) => void) | null
  _pending: InitData | null
}

;(window as any).EcomandaWidget = {
  init(this: EcomandaWidgetAPI, data: InitData) {
    if (this._handler) {
      this._handler(data)
    } else {
      this._pending = data
    }
  },
  _handler: null,
  _pending: null,
} as EcomandaWidgetAPI

function WidgetRoot() {
  const [isOpen, setIsOpen] = useState(false)
  const { session, createSession, loading: sessionLoading } = useWidgetSession(baseUrl, apiToken)
  const { messages, triggerPoll } = useWidgetMessages(baseUrl, apiToken, session)
  const { send, sending } = useWidgetSend(baseUrl, apiToken, session, triggerPoll)

  useEffect(() => {
    const api = (window as any).EcomandaWidget as EcomandaWidgetAPI
    api._handler = ({ name, email, phone }) => {
      createSession(name, email, phone)
    }
    if (api._pending) {
      const { name, email, phone } = api._pending
      api._pending = null
      createSession(name, email, phone)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <App
      licenseeApiToken={apiToken}
      isOpen={isOpen}
      onToggle={() => setIsOpen(o => !o)}
      session={session}
      onSessionCreate={createSession}
      messages={messages}
      onSend={send}
      sessionLoading={sessionLoading}
      sendDisabled={sending}
    />
  )
}

const host = document.createElement('div')
host.id = 'ecomanda-widget-host'
document.body.appendChild(host)
const shadow = host.attachShadow({ mode: 'open' })
const mountPoint = document.createElement('div')
shadow.appendChild(mountPoint)

ReactDOM.createRoot(mountPoint).render(<WidgetRoot />)
