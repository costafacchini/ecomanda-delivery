import { useRef, useEffect } from 'react'
import type { IRoom, IMessage } from '../../../types'
import styles from '../styles.module.scss'
import MessageInput from './MessageInput'

interface ConversationPanelProps {
  room: IRoom | null
  messages: IMessage[]
  onSend: (text: string) => void
  loading: boolean
  onBack: () => void
  onClose: () => void
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente',
  open: 'Aberta',
  closed: 'Encerrada',
}

const STATUS_CLASS: Record<string, string> = {
  pending: styles.statusPending,
  open: styles.statusOpen,
  closed: styles.statusClosed,
}

function formatMsgTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function ConversationPanel({ room, messages, onSend, loading, onBack, onClose }: ConversationPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!room) {
    return (
      <div className={styles.conversationEmpty} role='status' aria-label='Nenhuma conversa selecionada'>
        <i className='bi bi-chat-left-text' aria-hidden='true' />
        <p>Selecione uma conversa na lista ao lado.</p>
      </div>
    )
  }

  const statusClass = STATUS_CLASS[room.status] ?? styles.statusClosed
  const statusLabel = STATUS_LABEL[room.status] ?? room.status

  return (
    <>
      <div className={styles.convHeader}>
        <button
          type='button'
          className={styles.backBtn}
          onClick={onBack}
          aria-label='Voltar para lista de conversas'
        >
          <i className='bi bi-chevron-left' aria-hidden='true' />
        </button>

        <div className={styles.convHeaderInfo}>
          <span className={styles.convContactName}>{room.contact.name}</span>
          <span className={`${styles.convStatusBadge} ${statusClass}`} aria-label={`Status: ${statusLabel}`}>
            {statusLabel}
          </span>
        </div>

        {!room.closed && (
          <button
            type='button'
            className={styles.closeRoomBtn}
            onClick={onClose}
            aria-label='Concluir conversa'
          >
            Concluir
          </button>
        )}
      </div>

      {loading ? (
        <div className={styles.skeletonList} role='status' aria-label='Carregando mensagens'>
          <div className={`${styles.skeletonBubble} ${styles.in}`} />
          <div className={`${styles.skeletonBubble} ${styles.out}`} />
          <div className={`${styles.skeletonBubble} ${styles.in}`} />
        </div>
      ) : (
        <div className={styles.messageList} role='log' aria-label='Mensagens' aria-live='polite'>
          {messages.map((message) => {
            const fromMe = message.destination === 'to-messenger'
            return (
              <div
                key={message.id}
                className={`${styles.messageGroup} ${fromMe ? styles.outbound : styles.inbound}`}
              >
                <div className={`${styles.bubble} ${fromMe ? styles.bubbleSent : styles.bubbleReceived}`}>
                  <span className={styles.bubbleText}>
                    {message.text || (message.url ? '[arquivo]' : '[mensagem]')}
                  </span>
                  <span className={styles.bubbleTime} aria-hidden='true'>
                    {formatMsgTime(message.createdAt)}
                  </span>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} aria-hidden='true' />
        </div>
      )}

      <MessageInput onSend={onSend} disabled={loading || room.closed} />
    </>
  )
}
