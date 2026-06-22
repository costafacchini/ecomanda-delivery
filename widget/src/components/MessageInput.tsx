// Composer bar: textarea + send button.
// Enter submits; Shift+Enter inserts a newline. Clears after send.
// Uses inline styles only — the widget is isolated from host page CSS.
import React, { useState, useRef } from 'react'

interface MessageInputProps {
  onSend: (text: string) => void
  disabled: boolean
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-end',
  gap: 8,
  padding: '10px 12px',
  borderTop: '1px solid #e5e7eb',
  backgroundColor: '#f9fafb',
}

const textareaStyle: React.CSSProperties = {
  flex: 1,
  resize: 'none',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  padding: '8px 10px',
  fontSize: 14,
  lineHeight: 1.45,
  color: '#1a1a1a',
  backgroundColor: '#ffffff',
  outline: 'none',
  fontFamily: 'inherit',
  minHeight: 38,
  maxHeight: 78, // ~3 rows at 1.45 line-height × 14px + padding
  overflowY: 'auto',
}

const sendButtonStyle: React.CSSProperties = {
  flexShrink: 0,
  width: 36,
  height: 36,
  borderRadius: 8,
  backgroundColor: '#2563eb',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
}

const sendButtonDisabledStyle: React.CSSProperties = {
  ...sendButtonStyle,
  backgroundColor: '#93c5fd',
  cursor: 'not-allowed',
}

function SendIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

export function MessageInput({ onSend, disabled }: MessageInputProps): React.ReactElement {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function submit(): void {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
    // Reset textarea height after clearing
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  // Auto-grow textarea up to maxHeight
  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    setText(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 78)}px`
  }

  const isSendDisabled = disabled || !text.trim()

  return (
    <div style={containerStyle}>
      <textarea
        ref={textareaRef}
        style={textareaStyle}
        rows={1}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Digite uma mensagem..."
        disabled={disabled}
        aria-label="Mensagem"
      />
      <button
        style={isSendDisabled ? sendButtonDisabledStyle : sendButtonStyle}
        onClick={submit}
        disabled={isSendDisabled}
        aria-label="Enviar mensagem"
      >
        <SendIcon />
      </button>
    </div>
  )
}
