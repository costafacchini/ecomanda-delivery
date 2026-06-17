import React, { useRef, useEffect } from 'react'
import type { IRoom } from '../../../types'
import type { IMessage } from '../../../types'
import styles from '../styles.module.scss'
import MessageInput from './MessageInput'

interface ConversationPanelProps {
  room: IRoom | null
  messages: IMessage[]
  onSend: (text: string) => void
}

const STATUS_BADGE: Record<string, string> = {
  pending: 'warning',
  open: 'success',
  closed: 'secondary',
}

export default function ConversationPanel({ room, messages, onSend }: ConversationPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bottomRef.current && typeof bottomRef.current.scrollIntoView === 'function') {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  if (!room) {
    return <div className={styles.emptyState}>Selecione uma conversa.</div>
  }

  const badgeColor = STATUS_BADGE[room.status] ?? 'secondary'

  return (
    <div className={styles.conversation}>
      <div className={styles.conversationHeader}>
        <span className='fw-bold me-2'>{room.contact.name}</span>
        <span className={`badge bg-${badgeColor}`}>{room.status}</span>
      </div>
      <div className={styles.messageList}>
        {messages.map((message) => {
          const fromMe = message.sended === true
          return (
            <div
              key={message.id}
              className={`${styles.message} ${fromMe ? styles.messageFromMe : styles.messageInbound}`}
            >
              {message.text}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <MessageInput onSend={onSend} />
    </div>
  )
}
