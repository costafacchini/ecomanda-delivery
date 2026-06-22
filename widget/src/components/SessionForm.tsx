// Visitor identification form shown before a session exists.
// Validates email format client-side before surfacing to caller.
// Uses inline styles only — the widget is isolated from host page CSS.
import React, { useState } from 'react'

interface SessionFormProps {
  onSubmit: (name: string, email: string, phone?: string) => void
  loading: boolean
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  padding: 24,
  flex: 1,
  justifyContent: 'center',
}

const headingStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 600,
  color: '#1a1a1a',
  lineHeight: 1.3,
}

const subheadingStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: '#6b7280',
  lineHeight: 1.5,
}

const fieldGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
}

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: '#374151',
}

const inputStyle: React.CSSProperties = {
  padding: '9px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  fontSize: 14,
  color: '#1a1a1a',
  outline: 'none',
  transition: 'border-color 0.15s',
  backgroundColor: '#ffffff',
}

const inputErrorStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: '#ef4444',
}

const errorTextStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#ef4444',
  margin: 0,
}

const buttonStyle: React.CSSProperties = {
  marginTop: 4,
  padding: '10px 0',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  border: 'none',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  letterSpacing: 0.1,
}

const buttonDisabledStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: '#93c5fd',
  cursor: 'not-allowed',
}

export function SessionForm({ onSubmit, loading }: SessionFormProps): React.ReactElement {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [emailError, setEmailError] = useState('')

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()

    if (!EMAIL_REGEX.test(email)) {
      setEmailError('Informe um e-mail válido.')
      return
    }

    setEmailError('')
    onSubmit(name.trim(), email.trim(), phone.trim() || undefined)
  }

  return (
    <form style={containerStyle} onSubmit={handleSubmit} noValidate>
      <div>
        <p style={headingStyle}>Iniciar conversa</p>
        <p style={subheadingStyle}>Preencha seus dados para começar o atendimento.</p>
      </div>

      <div style={fieldGroupStyle}>
        <label style={labelStyle} htmlFor="widget-name">Nome</label>
        <input
          id="widget-name"
          style={inputStyle}
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          placeholder="Seu nome"
          disabled={loading}
        />
      </div>

      <div style={fieldGroupStyle}>
        <label style={labelStyle} htmlFor="widget-email">E-mail</label>
        <input
          id="widget-email"
          style={emailError ? inputErrorStyle : inputStyle}
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setEmailError('') }}
          required
          placeholder="seu@email.com"
          disabled={loading}
        />
        {emailError && <p style={errorTextStyle}>{emailError}</p>}
      </div>

      <div style={fieldGroupStyle}>
        <label style={labelStyle} htmlFor="widget-phone">Telefone (opcional)</label>
        <input
          id="widget-phone"
          style={inputStyle}
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="(00) 00000-0000"
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        style={loading ? buttonDisabledStyle : buttonStyle}
        disabled={loading || !name.trim() || !email.trim()}
      >
        {loading ? 'Aguarde...' : 'Iniciar conversa'}
      </button>
    </form>
  )
}
