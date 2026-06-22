// Fixed-position trigger button rendered in the host page's bottom-right corner.
// Uses inline styles only — the widget is isolated from host page CSS.
import React from 'react'

interface FloatingButtonProps {
  onClick: () => void
  isOpen: boolean
}

const BUTTON_SIZE = 56

const buttonStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 24,
  right: 24,
  width: BUTTON_SIZE,
  height: BUTTON_SIZE,
  borderRadius: '50%',
  backgroundColor: '#2563eb',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
  zIndex: 999999,
  padding: 0,
}

function ChatIcon(): React.ReactElement {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function CloseIcon(): React.ReactElement {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export function FloatingButton({ onClick, isOpen }: FloatingButtonProps): React.ReactElement {
  return (
    <button style={buttonStyle} onClick={onClick} aria-label={isOpen ? 'Fechar chat' : 'Abrir chat'}>
      {isOpen ? <CloseIcon /> : <ChatIcon />}
    </button>
  )
}
