// Scrollable message history. Auto-scrolls to newest message on update.
// Bubble alignment mirrors messenger convention: visitor right, agent left.
// Uses inline styles only — the widget is isolated from host page CSS.
import React, { useEffect, useRef } from 'react'
import type { WidgetMessage } from '../types'

interface MessageListProps {
  messages: WidgetMessage[]
}

const containerStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '12px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
}

const rowBaseStyle: React.CSSProperties = {
  display: 'flex',
}

const rowVisitorStyle: React.CSSProperties = {
  ...rowBaseStyle,
  justifyContent: 'flex-end',
}

const rowAgentStyle: React.CSSProperties = {
  ...rowBaseStyle,
  justifyContent: 'flex-start',
}

const bubbleBaseStyle: React.CSSProperties = {
  maxWidth: '72%',
  padding: '8px 12px',
  borderRadius: 12,
  fontSize: 14,
  lineHeight: 1.45,
  wordBreak: 'break-word',
}

// Visitor bubble: right-aligned, brand-adjacent blue tint
const bubbleVisitorStyle: React.CSSProperties = {
  ...bubbleBaseStyle,
  backgroundColor: '#dbeafe',
  color: '#1e40af',
  borderBottomRightRadius: 4,
}

// Agent bubble: left-aligned, neutral white with border
const bubbleAgentStyle: React.CSSProperties = {
  ...bubbleBaseStyle,
  backgroundColor: '#ffffff',
  color: '#1a1a1a',
  border: '1px solid #e5e7eb',
  borderBottomLeftRadius: 4,
}

const senderNameStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: '#6b7280',
  marginBottom: 2,
}

export function MessageList({ messages }: MessageListProps): React.ReactElement {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div style={containerStyle}>
      {messages.map(msg => {
        const isVisitor = msg.destination === 'to-chat'
        return (
          <div key={msg._id} style={isVisitor ? rowVisitorStyle : rowAgentStyle}>
            <div style={isVisitor ? bubbleVisitorStyle : bubbleAgentStyle}>
              {!isVisitor && msg.senderName && (
                <span style={senderNameStyle}>{msg.senderName}</span>
              )}
              {msg.text}
            </div>
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
