import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import LicenseeForm from './'
import { setLicenseeWebhook } from '../services/licensee'

jest.mock('../services/licensee')

describe('<LicenseeForm />', () => {
  const onSubmit = jest.fn()

  function mount(props = {}) {
    render(
      <MemoryRouter>
        <LicenseeForm onSubmit={onSubmit} {...props} />
      </MemoryRouter>)
  }

  it('is rendered with the default initial values', () => {
    mount()

    expect(screen.getByLabelText('Nome')).toHaveValue('')
    expect(screen.getByLabelText('E-email')).toHaveValue('')
    expect(screen.getByLabelText('Licença')).toHaveValue('demo')
    expect(screen.getByLabelText('Telefone')).toHaveValue('')
    expect(screen.getByLabelText('API token')).toHaveValue('')
    expect(screen.getByLabelText('Ativo')).not.toBeChecked()
    expect(screen.getByLabelText('Usa chatbot?')).not.toBeChecked()
    expect(screen.getByLabelText('Chatbot padrão')).toHaveValue('')
    expect(screen.getByLabelText('URL do chatbot')).toHaveValue('')
    expect(screen.getByLabelText('Token do chatbot')).toHaveValue('')
    expect(screen.getByLabelText('Token de acesso via API do chatbot')).toHaveValue('')
    expect(screen.getByLabelText('Chat padrão')).toHaveValue('')
    expect(screen.getByLabelText('Url do chat')).toHaveValue('')
    expect(screen.getByLabelText('Whatsapp padrão')).toHaveValue('')
    expect(screen.getByLabelText('Token do whatsapp')).toHaveValue('')
    expect(screen.getByLabelText('Url do whatsapp')).toHaveValue('')
    expect(screen.getByLabelText('Id da AWS')).toHaveValue('')
    expect(screen.getByLabelText('Senha AWS')).toHaveValue('')
    expect(screen.getByLabelText('Nome do bucket AWS')).toHaveValue('')
    expect(screen.getByLabelText('URL para webhook de Chat')).toHaveValue('')
    expect(screen.getByLabelText('URL para webhook de Chatbot')).toHaveValue('')
    expect(screen.getByLabelText('URL de webhook para transferir do Chatbot para o Chat')).toHaveValue('')
    expect(screen.getByLabelText('URL para webhook de whatsapp')).toHaveValue('')
  })

  it('can receive initial values', () => {
    const licensee = {
      name: 'Name',
      active: true,
      email: 'email@gmail.com',
      phone: '48999999215',
      apiToken: 'token',
      licenseKind: 'paid',
      useChatbot: true,
      chatbotDefault: 'landbot',
      chatbotUrl: 'URL chatbot',
      chatbotAuthorizationToken: 'token chatbot',
      chatbotApiToken: 'token api chatbot',
      whatsappDefault: 'utalk',
      whatsappToken: 'token whats',
      whatsappUrl: 'URL do whats',
      chatDefault: 'crisp',
      chatUrl: 'URL do chat',
      chatKey: 'key',
      chatIdentifier: 'identifier',
      awsId: 'ID da AWS',
      awsSecret: 'Senha da AWS',
      bucketName: 'Nome do bucket',
      urlChatWebhook: 'URL para webhook de Chat',
      urlChatbotWebhook: 'URL para webhook de Chatbot',
      urlChatbotTransfer: 'URL de webhook para transferir do Chatbot para o Chat',
      urlWhatsappWebhook: 'URL para webhook de whatsapp',
    }

    mount({ initialValues: licensee })

    expect(screen.getByLabelText('Nome')).toHaveValue('Name')
    expect(screen.getByLabelText('Ativo')).toBeChecked()
    expect(screen.getByLabelText('E-email')).toHaveValue('email@gmail.com')
    expect(screen.getByLabelText('Telefone')).toHaveValue('48999999215')
    expect(screen.getByLabelText('API token')).toHaveValue('token')
    expect(screen.getByLabelText('Licença')).toHaveValue('paid')
    expect(screen.getByLabelText('Usa chatbot?')).toBeChecked()
    expect(screen.getByLabelText('Chatbot padrão')).toHaveValue('landbot')
    expect(screen.getByLabelText('Whatsapp padrão')).toHaveValue('utalk')
    expect(screen.getByLabelText('URL do chatbot')).toHaveValue('URL chatbot')
    expect(screen.getByLabelText('Token do chatbot')).toHaveValue('token chatbot')
    expect(screen.getByLabelText('Token de acesso via API do chatbot')).toHaveValue('token api chatbot')
    expect(screen.getByLabelText('Token do whatsapp')).toHaveValue('token whats')
    expect(screen.getByLabelText('Url do whatsapp')).toHaveValue('URL do whats')
    expect(screen.getByLabelText('Chat padrão')).toHaveValue('crisp')
    expect(screen.getByLabelText('Url do chat')).toHaveValue('URL do chat')
    expect(screen.getByLabelText('Identifier')).toHaveValue('identifier')
    expect(screen.getByLabelText('Key')).toHaveValue('key')
    expect(screen.getByLabelText('Id da AWS')).toHaveValue('ID da AWS')
    expect(screen.getByLabelText('Senha AWS')).toHaveValue('Senha da AWS')
    expect(screen.getByLabelText('Nome do bucket AWS')).toHaveValue('Nome do bucket')
    expect(screen.getByLabelText('URL para webhook de Chat')).toHaveValue('URL para webhook de Chat')
    expect(screen.getByLabelText('URL para webhook de Chatbot')).toHaveValue('URL para webhook de Chatbot')
    expect(screen.getByLabelText('URL de webhook para transferir do Chatbot para o Chat')).toHaveValue('URL de webhook para transferir do Chatbot para o Chat')
    expect(screen.getByLabelText('URL para webhook de whatsapp')).toHaveValue('URL para webhook de whatsapp')
  })

  describe('fields', () => {
    it('disables chatbot fields if "Usa chatbot?" is false', () => {
      mount({ initialValues: { useChatbot: true } })

      expect(screen.getByLabelText('Usa chatbot?')).toBeChecked()
      expect(screen.getByLabelText('Chatbot padrão')).toBeEnabled()
      expect(screen.getByLabelText('URL do chatbot')).toBeEnabled()
      expect(screen.getByLabelText('Token do chatbot')).toBeEnabled()

      cleanup()
      mount({ initialValues: { useChatbot: false } })

      expect(screen.getByLabelText('Usa chatbot?')).not.toBeChecked()
      expect(screen.getByLabelText('Chatbot padrão')).toBeDisabled()
      expect(screen.getByLabelText('URL do chatbot')).toBeDisabled()
      expect(screen.getByLabelText('Token do chatbot')).toBeDisabled()
    })

    it('disables chat fields if "Chat padrão" is blank', () => {
      mount({ initialValues: { chatDefault: 'crisp' } })

      expect(screen.getByLabelText('Url do chat')).toBeEnabled()
      expect(screen.getByLabelText('Identifier')).toBeEnabled()
      expect(screen.getByLabelText('Key')).toBeEnabled()

      cleanup()
      mount({ initialValues: { chatDefault: '' } })

      expect(screen.getByLabelText('Url do chat')).toBeDisabled()
    })

    it('disables whatsapp fields if "Whatsapp padrão" is blank', () => {
      mount({ initialValues: { whatsappDefault: 'dialog' } })

      expect(screen.getByLabelText('Token do whatsapp')).toBeEnabled()
      expect(screen.getByLabelText('Url do whatsapp')).toBeEnabled()

      cleanup()
      mount({ initialValues: { whatsappDefault: '' } })

      expect(screen.getByLabelText('Token do whatsapp')).toBeDisabled()
      expect(screen.getByLabelText('Url do whatsapp')).toBeDisabled()
    })

    it('shows key and identifier fields if "Chat padrão" is crisp', () => {
      mount({ initialValues: { chatDefault: 'crisp' } })

      expect(screen.getByLabelText('Identifier')).toBeVisible()
      expect(screen.getByLabelText('Key')).toBeEnabled()

      cleanup()
      mount({ initialValues: { chatDefault: 'jivochat' } })

      expect(screen.queryByLabelText('Identifier')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Key')).not.toBeInTheDocument()
    })

    it('shows button set webhook if "Whatsapp padrão" is dialog and licensee has apiToken', () => {
      mount({ initialValues: { whatsappDefault: 'dialog' } })

      expect(screen.queryByRole('button', { name: 'Configurar Webhook na Dialog360' })).not.toBeInTheDocument()

      cleanup()
      mount({ initialValues: { apiToken: 'key' } })

      expect(screen.queryByRole('button', { name: 'Configurar Webhook na Dialog360' })).not.toBeInTheDocument()

      cleanup()
      mount({ initialValues: { whatsappDefault: 'dialog', apiToken: 'key' } })

      expect(screen.getByRole('button', { name: 'Configurar Webhook na Dialog360' })).toBeInTheDocument()
    })

    it('Configurar Webhook na Dialog360 click', () => {
      mount({ initialValues: { whatsappDefault: 'dialog', apiToken: 'key' } })

      expect(setLicenseeWebhook).not.toHaveBeenCalled()

      fireEvent.click(screen.getByRole('button', { name: 'Configurar Webhook na Dialog360' }))

      expect(setLicenseeWebhook).toHaveBeenCalledTimes(1)
    })
  })

  describe('submit', () => {
    it('is called when the user submits the form', async () => {
      mount()

      expect(onSubmit).not.toHaveBeenCalled()

      fireEvent.click(screen.getByText('Salvar'))

      await waitFor(() => expect(onSubmit).toHaveBeenCalled())

      expect(onSubmit).toHaveBeenCalledWith({
        name: '',
        email: '',
        phone: '',
        active: false,
        apiToken: '',
        licenseKind: 'demo',
        useChatbot: false,
        chatbotDefault: '',
        chatbotUrl: '',
        chatbotAuthorizationToken: '',
        chatbotApiToken: '',
        whatsappDefault: '',
        whatsappToken: '',
        whatsappUrl: '',
        chatDefault: '',
        chatIdentifier: '',
        chatKey: '',
        chatUrl: '',
        awsId: '',
        awsSecret: '',
        bucketName: '',
      })
    })
  })
})
