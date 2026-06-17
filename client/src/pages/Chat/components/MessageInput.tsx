import React, { useState } from 'react'
import styles from '../styles.module.scss'

interface MessageInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [text, setText] = useState('')

  function handleSend() {
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSend()
  }

  return (
    <div className={styles.messageFooter}>
      <input
        type='text'
        className='form-control'
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder='Digite uma mensagem...'
        disabled={disabled}
      />
      <button
        type='button'
        className='btn btn-success'
        onClick={handleSend}
        disabled={disabled}
      >
        Enviar
      </button>
    </div>
  )
}
