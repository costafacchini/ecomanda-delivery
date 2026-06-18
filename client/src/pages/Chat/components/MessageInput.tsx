import { useState } from 'react'
import styles from '../styles.module.scss'

interface MessageInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [text, setText] = useState('')

  function handleSend() {
    if (!text.trim() || disabled) return
    onSend(text.trim())
    setText('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={styles.messageFooter} role='form' aria-label='Enviar mensagem'>
      <input
        type='text'
        className={styles.messageInput}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder='Digite uma mensagem...'
        disabled={disabled}
        aria-label='Mensagem'
        autoComplete='off'
      />
      <button
        type='button'
        className={styles.sendBtn}
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        aria-label='Enviar'
      >
        {disabled
          ? <i className='bi bi-hourglass-split' aria-hidden='true' />
          : <i className='bi bi-send-fill' aria-hidden='true' />
        }
      </button>
    </div>
  )
}
