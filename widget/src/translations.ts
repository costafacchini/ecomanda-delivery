// Lightweight translations map for the widget IIFE bundle.
// Cannot use react-i18next here — the widget runs in an isolated Shadow DOM
// and must remain dependency-free. ~12 strings makes a plain map sufficient.
import type { Language } from './types'

interface WidgetStrings {
  sessionForm: {
    heading: string
    subheading: string
    nameLabel: string
    namePlaceholder: string
    emailLabel: string
    emailPlaceholder: string
    emailError: string
    phoneLabel: string
    phonePlaceholder: string
    loadingButton: string
    submitButton: string
  }
  messageInput: {
    placeholder: string
    ariaLabel: string
    sendAriaLabel: string
  }
}

const translations: Record<Language, WidgetStrings> = {
  pt: {
    sessionForm: {
      heading: 'Iniciar conversa',
      subheading: 'Preencha seus dados para começar o atendimento.',
      nameLabel: 'Nome',
      namePlaceholder: 'Seu nome',
      emailLabel: 'E-mail',
      emailPlaceholder: 'seu@email.com',
      emailError: 'Informe um e-mail válido.',
      phoneLabel: 'Telefone (opcional)',
      phonePlaceholder: '(00) 00000-0000',
      loadingButton: 'Aguarde...',
      submitButton: 'Iniciar conversa',
    },
    messageInput: {
      placeholder: 'Digite uma mensagem...',
      ariaLabel: 'Mensagem',
      sendAriaLabel: 'Enviar mensagem',
    },
  },
  en: {
    sessionForm: {
      heading: 'Start a conversation',
      subheading: 'Fill in your details to begin.',
      nameLabel: 'Name',
      namePlaceholder: 'Your name',
      emailLabel: 'E-mail',
      emailPlaceholder: 'you@email.com',
      emailError: 'Please enter a valid email address.',
      phoneLabel: 'Phone (optional)',
      phonePlaceholder: '+1 (000) 000-0000',
      loadingButton: 'Please wait...',
      submitButton: 'Start conversation',
    },
    messageInput: {
      placeholder: 'Type a message...',
      ariaLabel: 'Message',
      sendAriaLabel: 'Send message',
    },
  },
}

export function useWidgetStrings(language: Language): WidgetStrings {
  return translations[language] ?? translations.pt
}
