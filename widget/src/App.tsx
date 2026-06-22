import React from 'react'
import { FloatingButton } from './components/FloatingButton'
import { ChatPopup } from './components/ChatPopup'
import { SessionForm } from './components/SessionForm'
import { MessageList } from './components/MessageList'
import { MessageInput } from './components/MessageInput'
import type { WidgetMessage, WidgetSession } from './types'

interface AppProps {
  licenseeApiToken: string
  isOpen: boolean
  onToggle: () => void
  session: WidgetSession | null
  onSessionCreate: (name: string, email: string, phone?: string) => void
  messages: WidgetMessage[]
  onSend: (text: string) => void
  sessionLoading: boolean
  sendDisabled: boolean
}

export function App({
  isOpen,
  onToggle,
  session,
  onSessionCreate,
  messages,
  onSend,
  sessionLoading,
  sendDisabled,
}: AppProps): React.ReactElement {
  return (
    <>
      <FloatingButton onClick={onToggle} isOpen={isOpen} />
      {isOpen && (
        <ChatPopup>
          {!session
            ? <SessionForm onSubmit={onSessionCreate} loading={sessionLoading} />
            : (
              <>
                <MessageList messages={messages} />
                <MessageInput onSend={onSend} disabled={sendDisabled} />
              </>
            )
          }
        </ChatPopup>
      )}
    </>
  )
}
