// Fixed-position card anchored above and left of the FloatingButton.
// Uses inline styles only — the widget is isolated from host page CSS.
import React, { type ReactNode } from 'react'

interface ChatPopupProps {
  children: ReactNode
}

const popupStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 96, // 24px margin + 56px button + 16px gap
  right: 24,
  width: 360,
  height: 500,
  backgroundColor: '#ffffff',
  borderRadius: 12,
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  zIndex: 999998,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: 14,
  color: '#1a1a1a',
}

export function ChatPopup({ children }: ChatPopupProps): React.ReactElement {
  return <div style={popupStyle}>{children}</div>
}
